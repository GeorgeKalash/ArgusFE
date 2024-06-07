import { Autocomplete, Box, Button, DialogActions } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getButtons } from './Buttons'
import CustomComboBox from '../Inputs/CustomComboBox'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

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
  onClickGIA,
  onClickGL,
  onClickAC,
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
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [reportStore, setReportStore] = useState([])
  const [tooltip, setTooltip] = useState('')

  const getReportLayout = () => {
    setReportStore([])
    if (resourceId) {
      getRequest({
        extension: SystemRepository.ReportLayout,
        parameters: `_resourceId=${resourceId}`
      })
        .then(res => {
          if (res?.list) {
            setReportStore(
              res.list.map(item => ({
                api_url: item.api,
                reportClass: item.instanceName,
                parameters: item.parameters,
                layoutName: item.layoutName,
                assembly: 'ArgusRPT.dll'
              }))
            )
          }
        })
        .catch(error => {})
    }
  }

  useEffect(() => {
    getReportLayout()
  }, [resourceId])

  const handleButtonMouseEnter = text => {
    setTooltip(text)
  }

  const handleButtonMouseLeave = () => {
    setTooltip(null)
  }

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
    onClickGL: () => onClickGL(recordId),
    onClickAC: () => onClickAC(recordId),
    onClickGIA: () => onClickGIA(recordId)
  }

  const buttons = getButtons(platformLabels)

  return (
    <DialogActions sx={{ padding: '8px !important' }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
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
                onMouseEnter={() => handleButtonMouseEnter(platformLabels.Preview)}
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
          {buttons
            .filter(button => actions.some(action => action.key === button.key))
            .map((button, index) => {
              const correspondingAction = actions.find(action => action.key === button.key)
              const isVisible = eval(correspondingAction.condition)
              const isDisabled = eval(correspondingAction.disabled)
              const handleClick = functionMapping[correspondingAction.onClick] || correspondingAction.onClick

              return (
                isVisible && (
                  <div
                    className='button-container'
                    onMouseEnter={() => (isDisabled ? null : handleButtonMouseEnter(button.label))}
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
                        width: '50px !important',
                        height: '35px',
                        objectFit: 'contain',
                        minWidth: '30px !important'
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
          {buttons.map((button, index) => {
            if (!button.main) {
              return null
            }

            const isVisible = eval(button.condition)
            const isDisabled = eval(button.disabled)
            const handleClick = functionMapping[button.onClick]

            return (
              isVisible && (
                <div
                  className='button-container'
                  onMouseEnter={() => (isDisabled ? null : handleButtonMouseEnter(button.label))}
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
                      width: '50px !important',
                      height: '35px',
                      objectFit: 'contain',
                      minWidth: '30px !important'
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
        </Box>
      </Box>
    </DialogActions>
  )
}

export default WindowToolbar
