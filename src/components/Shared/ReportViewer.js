import { useEffect, useState, useContext } from 'react'
import { Box, Grid } from '@mui/material'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import RPBGridToolbar from './RPBGridToolbar'
import ResourceComboBox from './ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { generateReport } from 'src/utils/ReportUtils'
import CustomButton from '../Inputs/CustomButton'
import { CommonContext } from 'src/providers/CommonContext'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [reportStore, setReportStore] = useState([])
  const [report, setReport] = useState({ selectedFormat: '', selectedReport: '' })
  const [pdf, setPDF] = useState(null)
  const [exportFormats, setExportFormats] = useState([])
  const [formatIndex, setFormatIndex] = useState(0)
  const { width } = useWindowDimensions()

  const getExportFormats = async () => {
    await getAllKvsByDataset({
      _dataset: DataSets.EXPORT_FORMAT,
      callback: res => {
        if (res.length > 0) {
          setExportFormats(res)
          setFormatIndex(0)
          setReport(prev => ({
            ...prev,
            selectedFormat: res[0]
          }))
        }
      }
    })
  }

  const zoom =
    width <= 768 ? 90 : width <= 1024 ? 90 : width <= 1366 ? 100 : width <= 1600 ? 100 : width <= 1920 ? 140 : 180

  const getReportLayout = () => {
    getRequest({
      extension: SystemRepository.ReportLayout,
      parameters: `_resourceId=${resourceId}`
    }).then(async res => {
      const inactiveReports = await getRequest({
        extension: SystemRepository.ReportLayoutObject.qry,
        parameters: `_resourceId=${resourceId}`
      })
      let newList = res.list || []
      if (inactiveReports?.list?.length > 0) {
        const inactiveIds = new Set(inactiveReports.list.map(item => item.id))
        newList = newList.filter(item => !inactiveIds.has(item.id))
      }
      setReportStore(prevReportStore => {
        const existingIds = new Set(prevReportStore.map(report => report.id))
        const filteredNewItems = newList.filter(item => !existingIds.has(item.id))

        const newMappedItems = filteredNewItems.map(item => ({
          id: item.id,
          api_url: item.api,
          reportClass: item.instanceName,
          parameters: item.parameters,
          layoutName: item.layoutName,
          assembly: 'ArgusRPT.dll'
        }))

        return [...prevReportStore, ...newMappedItems]
      })
    })
  }

  const getReportTemplate = () => {
    const parameters = `_resourceId=${resourceId}`
    getRequest({
      extension: SystemRepository.ReportTemplate.qry,
      parameters
    }).then(res => {
      setReportStore(prevReportStore => [
        ...prevReportStore,
        ...res.list
          ?.filter(item => !item.isInactive)
          ?.map(item => ({
            api_url: item.wsName,
            reportClass: item.reportName,
            parameters: item.parameters,
            layoutName: item.caption,
            assembly: item.assembly
          }))
      ])
    })
  }

  useEffect(() => {
    getReportLayout()
    getReportTemplate()
    getExportFormats()
  }, [])

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
    const nextIndex = (formatIndex + 1) % exportFormats.length
    setFormatIndex(nextIndex)
    setReport(prev => ({
      ...prev,
      selectedFormat: exportFormats[nextIndex]
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
            <Grid container spacing={2} alignItems='center' wrap='nowrap'>
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
                  disabled={exportFormats.length === 0 || !report.selectedReport}
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
