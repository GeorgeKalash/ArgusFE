import { useEffect, useState, useContext } from 'react'
import { Autocomplete, Box, Button, TextField } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'
import { ExportFormat } from 'src/statics/ExportFormat'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import ParamsArrayToolbar from './paramsArrayToolbar'
import { useWindow } from 'src/windows'

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [reportStore, setReportStore] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(ExportFormat[0])
  const [pdf, setPDF] = useState(null)
  const [paramsArray, setParamsArray] = useState([])
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
      .catch(error => {})
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
      .catch(error => {})
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
    })
      .then(res => {
        switch (selectedFormat.key) {
          case 1:
            setPDF(res.recordId)
            break

          default:
            window.location.href = res.recordId
            break
        }
      })
      .catch(error => {})
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

  const openRPB = () => {
    stack({
      Component: ReportParameterBrowser,
      props: {
        reportName: selectedReport?.parameters,
        paramsArray: paramsArray,
        setParamsArray: setParamsArray
      },
      width: 700,
      height: 500,
      title: 'Report Parameters Browser'
    })
  }

  const formatDataForApi = paramsArray => {
    let minValue = Infinity

    for (const [index, { fieldId, value }] of Object.entries(paramsArray)) {
      const numericValue = Number(fieldId)
      if (numericValue < minValue) {
        minValue = numericValue
      }
    }

    const formattedData = paramsArray
      .map(({ fieldId, value }) => `${fieldId}|${value}`)
      .reduce((acc, curr, index) => acc + (index === minValue ? `${curr}` : `^${curr}`), '')

    return formattedData
  }

  const actions = [
    {
      key: 'OpenRPB',
      condition: true,
      onClick: openRPB,
      disabled: !selectedReport?.parameters
    },
    {
      key: 'GO',
      condition: true,
      onClick: () => generateReport({ _startAt: 0, _pageSize: 30, params: formatDataForApi(paramsArray) }),
      disabled: false
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          actions={actions}
          leftSection={
            <Box sx={{ display: 'flex', padding: 2, justifyContent: 'space-between' }}>
              <Autocomplete
                size='small'
                options={reportStore}
                value={selectedReport}
                getOptionLabel={option => option.layoutName || option.caption || ''}
                onChange={(e, newValue) => setSelectedReport(newValue)}
                renderInput={params => (
                  <TextField {...params} label='Select a report template' variant='outlined' fullWidth />
                )}
                sx={{ width: 300, height: 35 }}
                disableClearable
              />
              <Autocomplete
                size='small'
                options={ExportFormat}
                value={selectedFormat}
                getOptionLabel={option => option.value}
                onChange={(e, newValue) => setSelectedFormat(newValue)}
                renderInput={params => <TextField {...params} label='Select Format' variant='outlined' fullWidth />}
                sx={{ width: 200, pl: 2, height: 35 }}
                disableClearable
              />
            </Box>
          }
          bottomSection={paramsArray && paramsArray.length > 0 && <ParamsArrayToolbar paramsArray={paramsArray} />}
        ></GridToolbar>
      </Fixed>
      {pdf && (
        <Box id='reportContainer' sx={{ flex: 1, display: 'flex', p: 2 }}>
          <iframe title={selectedReport?.layoutName} src={pdf} width='100%' height='100%' allowFullScreen />
        </Box>
      )}
    </VertLayout>
  )
}

export default ReportViewer
