import { Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getButtons } from './Buttons'
import CustomComboBox from '../Inputs/CustomComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import CustomButton from '../Inputs/CustomButton'

const WindowToolbar = ({
  onSave,
  onSaveClear,
  onClear,
  onInfo,
  isSaved,
  isSavedClear,
  isInfo,
  isCleared,
  onORD,
  onGenerateReport,
  disabledSubmit,
  disabledSavedClear,
  disabledApply,
  editMode = false,
  infoVisible = true,
  onRecordRemarks,
  isClosed = false,
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

  const getReportLayout = async () => {
    const reportLayoutRes = await getRequest({
      extension: SystemRepository.ReportLayout,
      parameters: `_resourceId=${resourceId}`
    })

    const reportTemplateRes = await getRequest({
      extension: SystemRepository.ReportTemplate.qry,
      parameters: `_resourceId=${resourceId}`
    })

    const reportLayoutFilteringObject = await getRequest({
      extension: SystemRepository.ReportLayoutObject.qry,
      parameters: `_resourceId=${resourceId}`
    })

    const firstStore = reportLayoutRes?.list?.map(item => ({
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
      assembly: item.assembly
    }))

    const filteringItems = reportLayoutFilteringObject?.list

    const firstStore2 =
      firstStore?.filter(
        item => !filteringItems.some(filterItem => filterItem.id === item.id && filterItem.isInactive)
      ) || []

    const combinedStore = firstStore ? [...firstStore2, ...secondStore] : [...secondStore]

    setReportStore(combinedStore)

    if (combinedStore.length > 0) {
      setSelectedReport(combinedStore[0])
    }
  }
  useEffect(() => {
    const fetchReportLayout = async () => {
      if (previewReport) {
        await getReportLayout()
        if (reportStore.length > 0) setSelectedReport(reportStore[0])
      }
    }

    fetchReportLayout()
  }, [previewReport])

  const functionMapping = {
    actions,
    isSaved,
    isSavedClear,
    isInfo,
    isCleared,
    disabledSubmit,
    disabledSavedClear,
    disabledApply,
    infoVisible,
    onRecordRemarks,
    isPosted,
    isClosed,
    editMode,
    onSave,
    onORD,
    onSaveClear,
    onClear,
    onInfo
  }

  const buttons = getButtons(platformLabels)

  return (
    <Box sx={{ padding: '8px !important' }}>
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
            <CustomButton
              style={{ ml: 1 }}
              onClick={onGenerateReport}
              label={platformLabels.Preview}
              image={'preview.png'}
              disabled={!selectedReport}
              tooltipText={platformLabels.Preview}
            />
          </Box>
        ) : (
          <Box></Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {buttons
            .filter(button => actions.some(action => action.key === button.key))
            .map(button => {
              const correspondingAction = actions.find(action => action.key === button.key)
              const isVisible = eval(correspondingAction.condition)
              const isDisabled = eval(correspondingAction.disabled)
              const handleClick = functionMapping[correspondingAction.onClick] || correspondingAction.onClick

              return (
                isVisible && (
                  <CustomButton
                    onClick={handleClick}
                    label={button.label}
                    color={button.color}
                    border={button.border}
                    disabled={isDisabled}
                    image={button.image}
                    tooltipText={button.label}
                    viewLoader={correspondingAction?.viewLoader}
                  />
                )
              )
            })}
          {buttons.map(button => {
            if (!button.main) {
              return null
            }

            const isVisible = eval(button.condition)
            const isDisabled = eval(button.disabled)
            const handleClick = functionMapping[button.onClick]

            return (
              isVisible && (
                <CustomButton
                  onClick={handleClick}
                  label={button.label}
                  color={button.color}
                  border={button.border}
                  disabled={isDisabled}
                  image={button.image}
                  tooltipText={button.label}
                />
              )
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default WindowToolbar
