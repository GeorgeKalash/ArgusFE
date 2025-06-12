import { useEffect, useState, useContext } from 'react'
import { Autocomplete, Box, TextField, Menu, MenuItem } from '@mui/material'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'
import { ExportFormat } from 'src/statics/ExportFormat'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import RPBGridToolbar from './RPBGridToolbar'
import PopperComponent from './Popper/PopperComponent'

const ReportViewer = ({ resourceId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [reportStore, setReportStore] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(ExportFormat[0])
  const [pdf, setPDF] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

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

  const generateReport = ({ params = '', paramsDict = '' }) => {
    const obj = {
      api_url: selectedReport.api_url + '?_params=' + params,
      assembly: selectedReport.assembly,
      format: selectedFormat.key,
      reportClass: selectedReport.reportClass,
      paramsDict: paramsDict
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

  const onApply = ({ rpbParams, paramsDict }) => {
    generateReport({ _startAt: 0, _pageSize: 30, params: rpbParams, paramsDict: paramsDict })
  }

  const handleContextMenu = event => {
    event.preventDefault()
    if (pdf) {
      setContextMenu(contextMenu === null ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 } : null)
    }
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const handleOpenInNewTab = () => {
    if (pdf) {
      window.open(pdf, '_blank')
    }
    handleCloseContextMenu()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onApply={onApply}
          hasSearch={false}
          reportName={selectedReport?.parameters}
          leftSection={
            <Box sx={{ display: 'flex', padding: 2, justifyContent: 'space-between' }}>
              <Autocomplete
                size='small'
                options={reportStore}
                value={selectedReport}
                PopperComponent={PopperComponent}
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
                PopperComponent={PopperComponent}
                getOptionLabel={option => option.value}
                onChange={(e, newValue) => setSelectedFormat(newValue)}
                renderInput={params => <TextField {...params} label='Select Format' variant='outlined' fullWidth />}
                sx={{ width: 200, pl: 2, height: 35 }}
                disableClearable
              />
            </Box>
          }
        />
      </Fixed>
      {pdf && (
        <>
          <Box id='reportContainer' sx={{ flex: 1, display: 'flex', p: 2, position: 'relative' }}>
            <iframe
              title={selectedReport?.layoutName}
              src={pdf}
              width='100%'
              height='100%'
              allowFullScreen
              style={{ pointerEvents: 'auto' }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                cursor: 'context-menu'
              }}
              onContextMenu={handleContextMenu}
            />
          </Box>

          <Menu
            open={contextMenu !== null}
            onClose={handleCloseContextMenu}
            anchorReference='anchorPosition'
            anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
          >
            <MenuItem onClick={handleOpenInNewTab}>Open in New Tab</MenuItem>
          </Menu>
        </>
      )}
    </VertLayout>
  )
}

export default ReportViewer
