import { useEffect, useState, useContext } from 'react'
import { Autocomplete, Box, TextField } from '@mui/material'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import RPBGridToolbar from './RPBGridToolbar'
import PopperComponent from './Popper/PopperComponent'
import ResourceComboBox from './ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { generateReport } from 'src/utils/ReportUtils'

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [reportStore, setReportStore] = useState([])
  const [report, setReport] = useState({ selectedFormat: '', selectedReport: '' })
  const [pdf, setPDF] = useState(null)

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

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onApply={onApply}
          hasSearch={false}
          reportName={report.selectedReport?.parameters}
          leftSection={
            <Box sx={{ display: 'flex', padding: 2, justifyContent: 'space-between' }}>
              <Autocomplete
                size='small'
                options={reportStore}
                value={report.selectedReport}
                PopperComponent={PopperComponent}
                getOptionLabel={option => option.layoutName || option.caption || ''}
                onChange={(e, newValue) =>
                  setReport(prevState => ({
                    ...prevState,
                    selectedReport: newValue
                  }))
                }
                renderInput={params => (
                  <TextField {...params} label='Select a report template' variant='outlined' fullWidth />
                )}
                sx={{ width: 300, height: 35 }}
                disableClearable
              />
              <ResourceComboBox
                datasetId={DataSets.EXPORT_FORMAT}
                name='selectedFormat'
                valueField='key'
                displayField='value'
                values={report}
                required
                defaultIndex={0}
                onChange={(event, newValue) => {
                  setReport(prevState => ({
                    ...prevState,
                    selectedFormat: newValue
                  }))
                }}
              />
            </Box>
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
