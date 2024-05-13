// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Autocomplete, Box, Button, TextField } from '@mui/material'

// ** Custom Imports
import GridToolbar from 'src/components/Shared/GridToolbar'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'

// ** Statics
import { ExportFormat } from 'src/statics/ExportFormat'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import { useWindow } from 'src/windows'

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //states
  const [reportStore, setReportStore] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(ExportFormat[0])
  const [paramsArray, setParamsArray] = useState([])
  const [pdf, setPDF] = useState(null)
  const { stack } = useWindow()

  const getReportLayout = () => {
    var parameters = `_resourceId=${resourceId}`
    getRequest({
      extension: SystemRepository.ReportLayout,
      parameters: parameters
    })
      .then(res => {
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
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getReportTemplate = () => {
    var parameters = `_resourceId=${resourceId}`
    getRequest({
      extension: SystemRepository.ReportTemplate,
      parameters: parameters
    })
      .then(res => {
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
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const generateReport = ({ params = '' }) => {
    const obj = {
      api_url: selectedReport.api_url + '?_params=' + params,
      assembly: selectedReport.assembly,
      format: selectedFormat.key,
      reportClass: selectedReport.reportClass
    }
    postRequest({
      url: process.env.NEXT_PUBLIC_REPORT_URL,
      extension: DevExpressRepository.generate,
      record: JSON.stringify(obj)
    }).then(res => {
      switch (selectedFormat.key) {
        case 1:
          setPDF(res.recordId)
          break

        default:
          window.location.href = res.recordId
          break
      }
    })
  }

  useEffect(() => {
    getReportLayout()
    getReportTemplate()
  }, [])

  useEffect(() => {
    if (reportStore.length > 0 && !selectedReport)
      setSelectedReport(() => {
        return reportStore[0]
      })
  }, [reportStore])

  const formatDataForApi = paramsArray => {
    const formattedData = paramsArray.map(({ fieldId, value }) => `${fieldId}|${value}`).join('^')

    return formattedData
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          openRPB={() =>
            stack({
              Component: ReportParameterBrowser,
              props: {
                disabled: !selectedReport?.parameters,
                reportName: selectedReport?.parameters,
                paramsArray: paramsArray,
                setParamsArray: setParamsArray
              },
              width: 700,
              height: 500,
              title: 'Report Parameters Browser'
            })
          }
          disableRPB={!selectedReport?.parameters}
          onGo={generateReport}
          paramsArray={paramsArray}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Autocomplete
              size='small'
              options={reportStore}
              value={selectedReport}
              getOptionLabel={option => option.layoutName || option.caption || ''}
              onChange={(e, newValue) => setSelectedReport(newValue)}
              renderInput={params => (
                <TextField {...params} label='Select a report template' variant='outlined' fullWidth />
              )}
              sx={{ width: 300 }}
              disableClearable
            />
            <Autocomplete
              size='small'
              options={ExportFormat}
              value={selectedFormat}
              getOptionLabel={option => option.value}
              onChange={(e, newValue) => setSelectedFormat(newValue)}
              renderInput={params => <TextField {...params} label='Select Format' variant='outlined' fullWidth />}
              sx={{ width: 200, pl: 2 }}
              disableClearable
            />
            <Button
              sx={{ ml: 2 }}
              variant='contained'
              disabled={!selectedReport || !selectedFormat}
              onClick={() => generateReport({ params: formatDataForApi(paramsArray) })}
              size='small'
            >
              Generate Report
            </Button>
          </Box>
        </GridToolbar>
      </Fixed>
      {pdf && (
        <Box id='reportContainer' sx={{ flex: 1, display: 'flex', p: 2 }}>
          <iframe title={selectedReport?.layoutName} src={pdf} width='100%' height='100%' allowFullScreen />
        </Box>
      )}

      {/* <ReportParameterBrowser
        disabled={!selectedReport?.parameters}
        reportName={selectedReport?.parameters}
        open={reportParamWindowOpen}
        onClose={() => setReportParamWindowOpen(false)}
        paramsArray={paramsArray}
        setParamsArray={setParamsArray}
      /> */}
    </VertLayout>
  )
}

export default ReportViewer
