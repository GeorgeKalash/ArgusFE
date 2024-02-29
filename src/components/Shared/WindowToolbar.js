import { DialogActions, Button, Box, Autocomplete, TextField, Tooltip } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'

const WindowToolbar = ({
  onSave,
  onPost,
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
  isClosed = false,
  clientRelation,
  onClientRelation = false,
  isPosted = false,
  resourceId,
  setSelectedReport,
  selectedReport,
  previewReport,
  actions = []
}) => {
  const { getRequest } = useContext(RequestsContext)

  // //states
  const [reportStore, setReportStore] = useState([])
  const [buttonIcons, setButtonIcons] = useState({})

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
              <Tooltip title="Preview">
                <img src="/images/buttonsIcons/preview.png" alt="Preview" />
              </Tooltip>
            </Button>
          </Box>
        ) : (
          <Box></Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {actions.map((actionObj, index) => (
            <Tooltip title={`${actionObj.title}`} key={`${actionObj.title}`}>
              <Button
                key={index}
                onClick={actionObj.action}
                variant='contained'
                sx={{ mr: 1 ,
                  backgroundColor: actionObj.color,
                  '&:hover': { backgroundColor: actionObj.colorHover},
                }}
                style={{ display: actionObj.isHidden ? 'none' : 'block' }}
                disabled={actionObj.isDisabled}
              >
                <img src={`/images/buttonsIcons/${actionObj.title}.png`} alt={`${actionObj.title}`} />
              </Button>
            </Tooltip>
          ))}
          {onClear && (
            <Tooltip title="Clear">
              <Button onClick={onClear} sx={{ mr: 1 ,backgroundColor:'#f44336', '&:hover': { backgroundColor: '#99271f' }}} variant='contained'>
                <img src="/images/buttonsIcons/clear.png" alt="Clear" />
              </Button>
            </Tooltip>
          )}
          {clientRelation && (
            <Tooltip title="Client Relation">
              <Button
                onClick={onClientRelation}
                variant='contained'
                sx={{ mr: 1, 
                      mt: smallBox && 0,
                      backgroundColor:'#f44336',
                      '&:hover': { backgroundColor: '#d32f2f' }
                    }}
                disabled={!editMode}
              >
                <img src="/images/buttonsIcons/clear.png" alt="Client Relation" />
              </Button>
            </Tooltip>
          )}

          {onInfo && infoVisible && (
            <Tooltip title="Info">
              <Button onClick={onInfo} variant='contained' sx={{ mr: 1 ,backgroundColor:'#4355a5', '&:hover': { backgroundColor: '#24316b' }}} disabled={!editMode}>
                <img src="/images/buttonsIcons/info.png" alt="Info" />
              </Button>
            </Tooltip>

          )}
          {onPost && postVisible && (
            <Tooltip title="Post">
              <Button
                onClick={onPost}
                variant='contained'
                sx={{ mr: 1,
                      mt: smallBox && 0,
                      backgroundColor:'#231f20', 
                      '&:hover': { backgroundColor: '#1c1718' }}}
                disabled={isPosted || !editMode}
              >
                <img src="/images/buttonsIcons/post.png" alt="Post" />
              </Button>
            </Tooltip>
          )}
          {onSave && (
            <Tooltip title="Submit">
              <Button
                onClick={onSave}
                variant='contained'
                sx={{ mr: 2, mt: smallBox && 0 }}
                disabled={disabledSubmit || isPosted || isClosed}
              >
                <img src="/images/buttonsIcons/save.png" alt="Submit"/>
              </Button>
            </Tooltip>

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
