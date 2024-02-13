// ** MUI Imports
import { DialogActions, Button, Box, Autocomplete, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'

const WindowToolbar = ({
  print,
  onPreview,
  onSave,
  onPost,
  onClear,
  onInfo,
  disabledSubmit,
  editMode = false,
  smallBox = false,
  infoVisible = true,
  postVisible = false,
  clientRelation,
  onClientRelation = false,
  isPosted = false,
  resourceId,
  recordId,
  setPdfUrl,
  pdfURL
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //states
  const [reportStore, setReportStore] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)

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
        console.log(error)
      })
  }

  useEffect(() => {
    getReportLayout()
  }, [])

  const generateReport = () => {
    const obj = {
      api_url: selectedReport.api_url + `?_recordId=${recordId}`,
      assembly: selectedReport.assembly,
      format: 1,
      reportClass: selectedReport.reportClass
    }
    postRequest({
      url: process.env.NEXT_PUBLIC_REPORT_URL,
      extension: DevExpressRepository.generate,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log(res)
        setPdfUrl(res.recordId)
        console.log(pdfURL)
        onPreview()
      })
      .catch(error => {
        console.log({ generateReportERROR: error })
      })
  }

  return (
    <DialogActions>
      <Autocomplete
        size='small'
        options={reportStore}
        value={selectedReport}
        getOptionLabel={option => option.layoutName || option.caption || ''}
        onChange={(e, newValue) => setSelectedReport(newValue)}
        renderInput={params => <TextField {...params} label='Select a report template' variant='outlined' fullWidth />}
        sx={{ width: 250 }}
        disableClearable
      />
      <Button
        sx={{ ml: 2 }}
        variant='contained'
        disabled={!selectedReport}
        onClick={() => generateReport()}
        size='small'
      >
        Preview
      </Button>

      {onClear && (
        <Button onClick={onClear} variant='contained'>
          Clear
        </Button>
      )}
      {clientRelation && (
        <Button onClick={onClientRelation} variant='contained' sx={{ mt: smallBox && 0 }} disabled={!editMode}>
          Client Relation
        </Button>
      )}

      {onInfo && infoVisible && (
        <Button onClick={onInfo} variant='contained' disabled={!editMode}>
          Info
        </Button>
      )}
      {onPost && postVisible && (
        <Button onClick={onPost} variant='contained' sx={{ mt: smallBox && 0 }} disabled={isPosted || !editMode}>
          Post
        </Button>
      )}
      {onSave && (
        <Button onClick={onSave} variant='contained' sx={{ mt: smallBox && 0 }} disabled={disabledSubmit || isPosted}>
          Submit
        </Button>
      )}
    </DialogActions>
  )
}

export default WindowToolbar
