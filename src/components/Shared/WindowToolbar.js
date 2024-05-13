import { Autocomplete, Box, Button, DialogActions, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Buttons } from './Buttons'
import ResourceComboBox from './ResourceComboBox'
import CustomComboBox from '../Inputs/CustomComboBox'

const WindowToolbar = ({
  onSave,
  onCalculate,
  onPost,
  onClear,
  onInfo,
  onApply,
  isSaved,
  isInfo,
  isCleared,
  recordId,
  onApproval,
  onClickGL,
  onGenerateReport,
  disabledSubmit,
  disabledApply,
  editMode = false,
  infoVisible = true,
  onRecordRemarks,
  isClosed = false,
  onClientRelation = false,
  isPosted = false,
  resourceId,
  setSelectedReport,
  selectedReport,
  previewReport,
  actions = []
}) => {
  const functionMapping = {
    actions,
    isSaved,
    isInfo,
    isCleared,
    disabledSubmit,
    disabledApply,
    infoVisible,
    onRecordRemarks,
    isPosted,
    isClosed,
    editMode,
    onSave,
    onPost,
    onClear,
    onInfo,
    onApply,
    onApproval,
    onClientRelation,
    onClickGL: () => onClickGL(recordId)
  }
  const { getRequest } = useContext(RequestsContext)

  const [reportStore, setReportStore] = useState([])
  const [tooltip, setTooltip] = useState('')

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
        .catch(error => {})
    }
  }

  useEffect(() => {
    getReportLayout()
  }, [])

  const handleButtonMouseEnter = text => {
    setTooltip(text)
  }

  const handleButtonMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <DialogActions sx={{padding:'8px !important'}}>
      <style>
        {`
          .button-container {
            position: relative;
            display: inline-block;
          }
          .toast {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333333ad;
            color: white;
            padding: 3px 7px;
            border-radius: 7px;
            opacity: 0;
            transition: opacity 0.3s, top 0.3s;
            z-index: 1;
          }
          .button-container:hover .toast {
            opacity: 1;
            top: -40px;
          }
        `}
      </style>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingTop: 4
        }}
      >
        {previewReport ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
             <CustomComboBox
                    label={'Select a report template'}
                    valueField='caption'
                    displayField='layoutName'
                    store={reportStore}
                    value={selectedReport}
                    onChange={(e, newValue) => setSelectedReport(newValue)}
                    sx={{ width: 250 }}
                    disableClearable
                  />
            <Button
              sx={{ width: '20px', height: '35px', ml: 1 }}
              variant='contained'
              disabled={!selectedReport}
              onClick={onGenerateReport}
              size='small'
            >
              <div
                className='button-container'
                onMouseEnter={() => handleButtonMouseEnter('Preview')}
                onMouseLeave={handleButtonMouseLeave}
              >
                <img src='/images/buttonsIcons/preview.png' alt='Preview' />
                {tooltip && <div className='toast'>{tooltip}</div>}
              </div>
            </Button>
          </Box>
        ) : (
          <Box></Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {Buttons.filter(button => actions.some(action => action.key === button.key)).map((button, index) => {
            const correspondingAction = actions.find(action => action.key === button.key)
            const isVisible = eval(correspondingAction.condition)
            const isDisabled = eval(correspondingAction.disabled)
            const handleClick = functionMapping[correspondingAction.onClick] || correspondingAction.onClick

            return (
              isVisible && (
                <div
                  className='button-container'
                  onMouseEnter={() => (isDisabled ? null : handleButtonMouseEnter(button.key))}
                  onMouseLeave={handleButtonMouseLeave}
                  key={index}
                >
                  <Button
                    onClick={handleClick}
                    variant='contained'
                    sx={{
                      mr: 1,
                      backgroundColor: button.color,
                      '&:hover': {
                        backgroundColor: button.color,
                        opacity: 0.8
                      },
                      border: button.border,
                      width: '20px',
                      height: '35px',
                      objectFit: 'contain'
                    }}
                    disabled={isDisabled}
                  >
                    <img src={`/images/buttonsIcons/${button.image}`} alt={button.key} />
                  </Button>
                  {tooltip && <div className='toast'>{tooltip}</div>}
                </div>
              )
            )
          })}
          {Buttons.map((button, index) => {
            if (!button.main) {
              return null // Skip this iteration if button.main is not true
            }

            const isVisible = eval(button.condition)
            const isDisabled = eval(button.disabled)
            const handleClick = functionMapping[button.onClick]

            return (
              isVisible && (
                <div
                  className='button-container'
                  onMouseEnter={() => (isDisabled ? null : handleButtonMouseEnter(button.key))}
                  onMouseLeave={handleButtonMouseLeave}
                  key={index}
                >
                  <Button
                    onClick={handleClick}
                    variant='contained'
                    sx={{
                      mr: 1,
                      backgroundColor: button.color,
                      '&:hover': {
                        backgroundColor: button.color,
                        opacity: 0.8
                      },
                      border: button.border,
                      width: '20px',
                      height: '35px',
                      objectFit: 'contain',
                    }}
                    disabled={isDisabled}
                  >
                    <img src={`/images/buttonsIcons/${button.image}`} alt={button.key} />
                  </Button>
                  {tooltip && <div className='toast'>{tooltip}</div>}
                </div>
              )
            )
          })}
        </Box>{' '}
      </Box>
    </DialogActions>
  )
}

export default WindowToolbar
