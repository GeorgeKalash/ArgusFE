import { DialogActions, Button, Box, Autocomplete, TextField, Tooltip } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Buttons } from './Buttons' 
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'

const WindowToolbar = ({
  onSave,
  onPost,
  onTFR,
  onClear,
  onInfo,
  onApply,
  recordId,
  onClose,
  newHandler,
  onGenerateReport,
  disabledSubmit,
  disabledApply,
  editMode = false,
  smallBox = false,
  infoVisible = true,
  NewComponentVisible,
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

  const [showGLC, setShowGLC] = useState(false)

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
              <Tooltip title='Preview'>
                <img src='/images/buttonsIcons/preview.png' alt='Preview' />
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
                onClick={actionObj.action}
                variant='contained'
                sx={{
                  mr: 1,
                  backgroundColor: actionObj.color,
                  '&:hover': { backgroundColor: actionObj.colorHover },
                  width: 20,
                  height: 35,
                  objectFit: 'contain',
                  border: actionObj.border
                }}
                style={{ display: actionObj.isHidden ? 'none' : 'block' }}
                disabled={actionObj.isDisabled}
              >
                <img src={`/images/buttonsIcons/${actionObj.title}.png`} alt={`${actionObj.title}`} />
              </Button>
            </Tooltip>
          ))}
          {Buttons.map((button, index) => (
            eval(button.condition) && (
              <Tooltip title={button.title} key={index}>
                <Button
                  onClick={() => eval(button.onClick)}
                  variant="contained"
                  sx={{
                    mr: 1,
                    backgroundColor: button.color,
                    '&:hover': { 
                      backgroundColor: button.color,
                      opacity: 0.8,
                    },
                    width: 20,
                    height: 35,
                    objectFit: 'contain'
                  }}
                  disabled={eval(button.disabled)}
                >
                  <img src={`/images/buttonsIcons/${button.image}`} alt={button.title} />
                </Button>
              </Tooltip>
            )
          ))
        }
        </Box>{' '}
      </Box>
    </DialogActions>
  )
}

export default WindowToolbar
