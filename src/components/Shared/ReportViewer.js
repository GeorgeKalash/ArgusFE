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

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [reportStore, setReportStore] = useState([])
  const [report, setReport] = useState({ selectedFormat: '', selectedReport: '' })
  const [pdf, setPDF] = useState(null)
  const [exportFormats, setExportFormats] = useState([])
  const [formatIndex, setFormatIndex] = useState(0)

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

  const getReportLayout = () => {
    var parameters = `_resourceId=${resourceId}`
    getRequest({
      extension: SystemRepository.ReportLayout,
      parameters: parameters
    }).then(res => {
      setReportStore(prevReportStore => [
        ...prevReportStore,
        ...res.list.map(item => ({
          api_url: item.api,
          reportClass: item.instanceName,
          parameters: item.parameters,
          layoutName: item.layoutName,
          assembly: 'ArgusRPT.dll'
        }))
      ])
    })
  }

  const getReportTemplate = () => {
    var parameters = `_resourceId=${resourceId}`
    getRequest({
      extension: SystemRepository.ReportTemplate.qry,
      parameters: parameters
    }).then(res => {
      setReportStore(prevReportStore => [
        ...prevReportStore,
        ...res.list.map(item => ({
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

  const onApply = async ({ paramsDict }) => {
    const result = await generateReport({
      postRequest,
      paramsDict: paramsDict,
      resourceId,
      isReport: true,
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
          leftSection={
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item xs={10}>
                  <ResourceComboBox
                    store={reportStore}
                    label='Select a report template'
                    name='selectedReport'
                    valueField='layoutName'
                    displayField='layoutName'
                    values={report}
                    required
                    defaultIndex={0}
                    onChange={(e, newValue) =>
                      setReport(prevState => ({
                        ...prevState,
                        selectedReport: newValue
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomButton
                    onClick={cycleFormat}
                    image={`${report.selectedFormat?.value || 'PDF'}.png`}
                    border='1px solid black'
                    disabled={exportFormats.length === 0 || !report.selectedReport}
                  />
                </Grid>
              </Grid>
            </Grid>
          }
        />
      </Fixed>
      {pdf && (
        <Box id='reportContainer' sx={{ flex: 1, display: 'flex', p: 2 }}>
          <iframe title={report.selectedReport?.layoutName} src={pdf} width='100%' height='100%' allowFullScreen />
        </Box>
      )}
    </VertLayout>
  )
}

export default ReportViewer
