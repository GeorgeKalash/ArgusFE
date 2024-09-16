import { Box, Button, DialogActions } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getButtons } from './Buttons'
import CustomComboBox from '../Inputs/CustomComboBox'
import { ControlContext } from 'src/providers/ControlContext'

const WindowToolbar = ({
  onSave,
  onSaveClear,
  transactionClicked,
  onPost,
  onClear,
  onInfo,
  onGenerate,

  onApply,
  isSaved,
  isSavedClear,
  isInfo,
  isCleared,
  isGenerated,
  recordId,
  onApproval,
  onClickGIA,
  onClickGL,
  onClickAC,
  onClickIT,
  onGenerateReport,
  disabledSubmit,
  disabledSavedClear,
  disabledApply,
  editMode = false,
  infoVisible = true,
  onRecordRemarks,
  isClosed = false,
  onClientRelation = false,
  onAddClientRelation = false,
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

  const getReportLayout = async () => {
    try {
      const reportLayoutRes = await getRequest({
        extension: SystemRepository.ReportLayout,
        parameters: `_resourceId=${resourceId}`
      })

      const reportTemplateRes = await getRequest({
        extension: SystemRepository.ReportTemplate,
        parameters: `_resourceId=${resourceId}`
      })

      const reportLayoutFilteringObject = await getRequest({
        extension: SystemRepository.ReportLayoutObject,
        parameters: `_resourceId=${resourceId}`
      })

      let firstStore = reportLayoutRes?.list?.map(item => ({
        id: item.id,
        api_url: item.api,
        reportClass: item.instanceName,
        parameters: item.parameters,
        layoutName: item.layoutName,
        assembly: 'ArgusRPT.dll'
      }))

      const secondStore = reportTemplateRes?.list?.map(item => ({
        id: item.id,
        api_url: item.wsName,
        reportClass: item.reportName,
        parameters: item.parameters,
        layoutName: item.caption,
        assembly: 'ArgusRPT.dll'
      }))

      const filteringItems = reportLayoutFilteringObject?.list

      firstStore = firstStore.filter(
        item => !filteringItems.some(filterItem => filterItem.id === item.id && filterItem.isInactive)
      )

      const combinedStore = [...firstStore, ...secondStore]

      setReportStore(combinedStore)

      if (combinedStore.length > 0) {
        setSelectedReport(combinedStore[0])
      }
    } catch (error) {}
  }
  useEffect(() => {
    if (resourceId) {
      getReportLayout()
    }
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
    isSavedClear,
    isInfo,
    isCleared,
    isGenerated,
    disabledSubmit,
    disabledSavedClear,
    disabledApply,
    infoVisible,
    onRecordRemarks,
    isPosted,
    isClosed,
    editMode,
    onSave,
    onSaveClear,
    onPost,
    transactionClicked,
    onClear,
    onInfo,
    onGenerate,
    onApply,
    onClickIT,
    onApproval,
    onClientRelation,
    onAddClientRelation,

    onClickGL: () => onClickGL(recordId),
    onClickAC: () => onClickAC(recordId),
    onClickGIA: () => onClickGIA(recordId)
  }

  const buttons = getButtons(platformLabels)

  useEffect(() => {
    if (previewReport && reportStore.length > 0) {
      setSelectedReport(reportStore[0])
    }
  }, [previewReport, reportStore])

  return (
    <Box sx={{ padding: '8px !important' }}>
      <style>
        {`
          .button-container {
            position: relative;
            display: inline-block;
          }
          .toast {
            position: absolute;
            top: -30px;
            background-color: #333333ad;
            color: white;
            padding: 3px 7px;
            border-radius: 7px;
            opacity: 0;
            transition: opacity 0.3s, top 0.3s;
            z-index: 1 !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: none;
            }
          .button-container:hover .toast {
            opacity: 1;
            top: -40px;
            display: inline;
          }
          }
        `}
      </style>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {previewReport ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CustomComboBox
              label={'Select a report template'}
              valueField='layoutName'
              displayField='layoutName'
              store={reportStore}
              value={selectedReport}
              onChange={(e, newValue) => {
                setSelectedReport(newValue)
              }}
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
    </Box>
  )
}

export default WindowToolbar
