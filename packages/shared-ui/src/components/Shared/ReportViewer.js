import { useEffect, useState, useContext } from 'react'
import { Box, Grid } from '@mui/material'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import RPBGridToolbar from './RPBGridToolbar'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { generateReport } from '@argus/shared-utils/src/utils/ReportUtils'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { exportFormat } = useContext(ControlContext)
  const [reportStore, setReportStore] = useState([])
  const [report, setReport] = useState({ selectedFormat: '', selectedReport: '' })
  const [pdf, setPDF] = useState(null)
  const [formatIndex, setFormatIndex] = useState(0)
  const { width } = useWindowDimensions()

  const getExportFormats = async () => {
    if (!exportFormat.length) return
    setFormatIndex(0)
    setReport(prev => ({
      ...prev,
      selectedFormat: exportFormat[0]
    }))
  }

  const zoom =
    width <= 768 ? 90 : width <= 1024 ? 90 : width <= 1366 ? 100 : width <= 1600 ? 100 : width <= 1920 ? 140 : 180

  const getReportLayout = async () => {
    const reportPack = await getRequest({
      extension: SystemRepository.ReportLayout.get,
      parameters: `_resourceId=${resourceId}`
    })
    const pack = reportPack?.record || {}

    let layouts = pack?.layouts || []
    if (pack?.reportLayoutOverrides?.length) {
      const inactiveIds = new Set((pack?.reportLayoutOverrides || []).map(item => item.id))
      layouts = layouts.filter(item => !inactiveIds.has(item.id))
    }

    setReportStore(prev => {
      const existingIds = new Set(prev.map(r => r.id))

      const layoutsPack = layouts
        ?.filter(item => !existingIds.has(item.id))
        .map(item => ({
          id: item.id,
          api_url: item.api,
          reportClass: item.instanceName,
          parameters: item.parameters,
          layoutName: item.layoutName,
          assembly: 'ArgusRPT.dll'
        }))

      const templatesPack = (pack?.reportTemplates || [])
        .filter(item => !item.isInactive)
        .map(item => ({
          api_url: item.wsName,
          reportClass: item.reportName,
          parameters: item.parameters,
          layoutName: item.caption,
          assembly: item.assembly
        }))

      return [...prev, ...layoutsPack, ...templatesPack]
    })
  }

  useEffect(() => {
    getReportLayout()
  }, [])

  useEffect(() => {
    getExportFormats()
  }, [exportFormat])

  useEffect(() => {
    if (reportStore.length > 0 && !report.selectedReport)
      setReport(prevState => ({
        ...prevState,
        selectedReport: reportStore[0]
      }))
  }, [reportStore])

  const onApply = async ({ rpbParams, paramsDict }) => {
    const result = await generateReport({
      isReport: true,
      postRequest,
      paramsDict: paramsDict,
      params: rpbParams,
      resourceId,
      selectedReport: report.selectedReport,
      selectedFormat: report.selectedFormat.key
    })
    switch (parseInt(report.selectedFormat.key)) {
      case 1:
        setPDF(result)
        break

      default:
        window.location.href = result
        break
    }
  }

  const cycleFormat = () => {
    const nextIndex = (formatIndex + 1) % exportFormat.length
    setFormatIndex(nextIndex)
    setReport(prev => ({
      ...prev,
      selectedFormat: exportFormat[nextIndex]
    }))
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onApply={onApply}
          hasSearch={false}
          reportName={report.selectedReport?.parameters}
          disableActionsPadding
          leftSection={
            <Grid container spacing={2} alignItems='end' wrap='nowrap'>
              <Grid item xs>
                <ResourceComboBox
                  store={reportStore}
                  label='Select a report template'
                  name='selectedReport'
                  valueField='layoutName'
                  displayField='layoutName'
                  values={report}
                  required
                  defaultIndex={0}
                  fullWidth
                  onChange={(e, newValue) =>
                    setReport(prevState => ({
                      ...prevState,
                      selectedReport: newValue
                    }))
                  }
                />
              </Grid>
          
              <Grid item>
                <CustomButton
                  onClick={cycleFormat}
                  image={`${report.selectedFormat?.value || 'PDF'}.png`}
                  disabled={exportFormat.length == 0 || !report.selectedReport}
                />
              </Grid>
            </Grid>
          }
          
        />
      </Fixed>

      {pdf && (
        <Box id='reportContainer' sx={{ flex: 1, display: 'flex', p: 2, position: 'relative' }}>
          <iframe
            title={report.selectedReport?.layoutName}
            src={`${pdf}#zoom=${zoom}`}
            width='100%'
            height='100%'
            allowFullScreen
          />
          <Box position='absolute' top={20} right={130} zIndex={1}>
            <CustomButton
              image='popup.png'
              color='#231F20'
              onClick={() => {
                if (pdf) {
                  window.open(pdf, '_blank')
                }
              }}
            />
          </Box>
        </Box>
      )}
    </VertLayout>
  )
}

export default ReportViewer
