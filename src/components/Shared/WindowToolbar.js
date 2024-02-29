// ** MUI Imports
import { DialogActions, Button, Box, Autocomplete, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'

const WindowToolbar = ({
  onSave,
  onPost,
  onTFR,
  onClear,
  onInfo,
  onApply,
  onClose,
  onGenerateReport,
  disabledSubmit,
  disabledApply,
  editMode = false,
  smallBox = false,
  infoVisible = true,
  postVisible = false,
  visibleTFR = false,
  isClosed = false,
  clientRelation,
  onClientRelation = false,
  isPosted = false,
  isTFR = false,
  resourceId,
  setSelectedReport,
  selectedReport,
  previewReport,
  actions = []
}) => {
  const { getRequest } = useContext(RequestsContext)

  // //states
  const [reportStore, setReportStore] = useState([])

  const getReportLayout = () => {
    setReportStore([])
    if (resourceId) {
      var parameters = `_resourceId=${resourceId}`
      getRequest({
        extension: SystemRepository.ReportLayout,
        parameters: parameters
      })
        .then(res => {
          if (res?.list)
            setReportStore(
              res.list.map(item => ({
                api_url: item.api,
                reportClass: item.instanceName,
                parameters: item.parameters,
                layoutName: item.layoutName,
                assembly: 'ArgusRPT.dll'
              }))
            )
        })
        .catch(error => {
          console.log(error)
        })
    }
  }

  useEffect(() => {
    getReportLayout()
  }, [])

  return (
    <DialogActions>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {previewReport ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Autocomplete
              size='small'
              options={reportStore}
              value={selectedReport}
              getOptionLabel={option => option.layoutName || option.caption || ''}
              onChange={(e, newValue) => setSelectedReport(newValue)}
              renderInput={params => (
                <TextField {...params} label='Select a report template' variant='outlined' fullWidth />
              )}
              sx={{ width: 250 }}
              disableClearable
            />
            <Button
              sx={{ ml: 2 }}
              variant='contained'
              disabled={!selectedReport}
              onClick={onGenerateReport}
              size='small'
            >
              Preview
            </Button>
          </Box>
        ) : (
          <Box></Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {actions.map((actionObj, index) => (
            <Button
              key={index}
              onClick={actionObj.action}
              variant='contained'
              sx={{ mr: 1 }}
              style={{ display: actionObj.isHidden ? 'none' : 'block' }}
              disabled={actionObj.isDisabled}
            >
              {actionObj.title}
            </Button>
          ))}
          {onTFR && visibleTFR && (
            <Button onClick={onTFR} variant='contained' sx={{ mr: 1, mt: smallBox && 0 }} disabled={!isTFR}>
              Transfer
            </Button>
          )}
          {onClear && (
            <Button onClick={onClear} sx={{ mr: 1 }} variant='contained'>
              Clear
            </Button>
          )}
          {clientRelation && (
            <Button
              onClick={onClientRelation}
              variant='contained'
              sx={{ mr: 1, mt: smallBox && 0 }}
              disabled={!editMode}
            >
              Client Relation
            </Button>
          )}

          {onInfo && infoVisible && (
            <Button onClick={onInfo} variant='contained' sx={{ mr: 1 }} disabled={!editMode}>
              Info
            </Button>
          )}
          {onPost && postVisible && (
            <Button
              onClick={onPost}
              variant='contained'
              sx={{ mr: 1, mt: smallBox && 0 }}
              disabled={isPosted || !editMode}
            >
              Post
            </Button>
          )}
          {onSave && (
            <Button
              onClick={onSave}
              variant='contained'
              sx={{ mr: 2, mt: smallBox && 0 }}
              disabled={disabledSubmit || isPosted || isClosed}
            >
              Submit
            </Button>
          )}
          {onApply && (
            <Button onClick={onApply} variant='contained' disabled={disabledApply}>
              Apply
            </Button>
          )}
        </Box>{' '}
      </Box>
    </DialogActions>
  )
}

export default WindowToolbar
