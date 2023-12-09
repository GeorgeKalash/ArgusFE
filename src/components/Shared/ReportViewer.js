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
import { ReportRepository } from 'src/repositories/ReportRepository'

// ** Statics
import { ExportFormat } from 'src/statics/ExportFormat'

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //states
  const [reportStore, setReportStore] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [paramsArray, setParamsArray] = useState([])
  const [reportParamWindowOpen, setReportParamWindowOpen] = useState(false)
  const [pdf, setPDF] = useState(null)
  const [xls, setXLS] = useState(null)
  const [csv, setCSV] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

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

  // const generateReport = ({ params = '' }) => {
  //   const obj = {
  //     api_url: selectedReport.api_url + '?_params=',
  //     assembly: selectedReport.assembly,
  //     format: selectedFormat,
  //     reportClass: selectedReport.reportClass
  //   }
  //   postRequest({
  //     url: process.env.NEXT_PUBLIC_REPORT_URL,
  //     extension: ReportRepository.generateReport,
  //     record: JSON.stringify(obj)
  //   })
  //     .then(res => {
  //       console.log({ res })
  //     })
  //     .catch(error => {
  //       setErrorMessage(error)
  //     })
  // }

  const generateReport = ({ params = '' }) => {
    switch (selectedFormat) {
      case 1:
        setPDF('https://s3.eu-west-1.amazonaws.com/argus.erp/e8605ac4b66b4678.pdf')
        break
      case 2:
        setXLS('https://s3.eu-west-1.amazonaws.com/argus.erp/CLIENT-FILE.xlsx')
        break
      case 3:
        setCSV('https://s3.eu-west-1.amazonaws.com/argus.erp/CLIENT-FILE.csv')
        break

      default:
        break
    }
  }

  useEffect(() => {
    getReportLayout()
    getReportTemplate()
  }, [])

  const formatDataForApi = paramsArray => {
    const formattedData = paramsArray.map(({ fieldId, value }) => `${fieldId}|${value}`).join('^')

    return formattedData
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar
          openRPB={() => setReportParamWindowOpen(true)}
          disableRPB={!selectedReport?.parameters}
          onGo={generateReport}
          paramsArray={paramsArray}
        >
          <Box sx={{ pt: 2, px: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex' }}>
              <Autocomplete
                size='small'
                options={reportStore}
                getOptionLabel={option => option.layoutName || option.caption || ''}
                onChange={(e, newValue) => setSelectedReport(newValue)}
                renderInput={params => (
                  <TextField {...params} label='Select a report template' variant='outlined' fullWidth />
                )}
                sx={{ width: 300 }}
              />
              <Autocomplete
                size='small'
                options={ExportFormat}
                getOptionLabel={option => option.value}
                onChange={(e, newValue) => setSelectedFormat(newValue.key)}
                renderInput={params => <TextField {...params} label='Select Format' variant='outlined' fullWidth />}
                sx={{ width: 200, pl: 2 }}
              />
              <Button
                sx={{ ml: 2 }}
                variant='contained'
                disabled={!selectedReport || !selectedFormat}
                onClick={() => generateReport({ params: formatDataForApi(paramsArray) })}
              >
                Generate Report
              </Button>
            </Box>
            <Box sx={{ display: 'flex' }}>
              <Button sx={{ ml: 2 }} variant='contained' disabled={!xls} href={xls}>
                XLS
              </Button>
              <Button sx={{ ml: 2 }} variant='contained' disabled={!csv} href={csv}>
                CSV
              </Button>
            </Box>
          </Box>
        </GridToolbar>
        {pdf && (
          <Box id='reportContainer' sx={{ flex: 1, display: 'flex', p: 2 }}>
            <iframe title={selectedReport?.layoutName} src={pdf} width='100%' height='100%' allowFullScreen />
          </Box>
        )}
      </Box>
      <ReportParameterBrowser
        disabled={!selectedReport?.parameters}
        reportName={selectedReport?.parameters}
        open={reportParamWindowOpen}
        onClose={() => setReportParamWindowOpen(false)}
        paramsArray={paramsArray}
        setParamsArray={setParamsArray}
      />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ReportViewer
