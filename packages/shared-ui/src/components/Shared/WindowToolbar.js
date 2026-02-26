import { Box, Grid } from '@mui/material'
import { useContext, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { getButtons } from './Buttons'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomButton from '../Inputs/CustomButton'
import ReportGenerator from './ReportGenerator'

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
  disabledSubmit,
  disabledSavedClear,
  disabledApply,
  editMode = false,
  infoVisible = true,
  onRecordRemarks,
  isClosed = false,
  isPosted = false,
  resourceId,
  previewReport,
  recordId,
  form,
  previewBtnClicked,
  maxAccess,
  onPrint,
  reportSize,
  actions = []
}) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [reportStore, setReportStore] = useState([])

  const getReportLayout = async () => {
    const reportPack = await getRequest({
      extension: SystemRepository.ReportLayout.get,
      parameters: `_resourceId=${resourceId}`
    })
    const pack = reportPack?.record || {}

    const firstStore = (pack?.layouts || []).map(item => ({
      id: item.id,
      api_url: item.api,
      reportClass: item.instanceName,
      parameters: item.parameters,
      layoutName: item.layoutName,
      assembly: 'ArgusRPT.dll'
    }))

    const secondStore = (pack?.reportTemplates || []).map(item => ({
      id: item.id,
      api_url: item.wsName,
      reportClass: item.reportName,
      parameters: item.parameters,
      layoutName: item.caption,
      assembly: item.assembly
    }))

    const filteringItems = pack?.reportLayoutOverrides || []

    const firstStore2 =
      firstStore?.filter(
        item => !filteringItems.some(filterItem => filterItem.id === item.id && filterItem.isInactive)
      ) || []

    const combinedStore = firstStore ? [...firstStore2, ...secondStore] : [...secondStore]

    setReportStore(
      (combinedStore || []).map((item, index) => ({
        ...item,
        uniqueId: index + 1
      }))
    )
  }

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
        {!!onPrint ? (
          <Grid item xs={3} sx={{ display: 'flex', mr: 2 }}>
            <CustomButton onClick={onPrint} image={'print.png'} disabled={!editMode} />
          </Grid>
        ) : (
          <></>
        )}
        {previewReport ? (
          <ReportGenerator
            previewReport={previewReport}
            form={form}
            resourceId={resourceId}
            condition={previewReport}
            reportStore={reportStore}
            getReportLayout={getReportLayout}
            recordId={recordId}
            reportSize={reportSize}
            previewBtnClicked={previewBtnClicked}
          />
        ) : (
          <Box></Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {buttons
            .filter(button => actions.some(action => action.key === button.key))
            .map(button => {
              const correspondingAction = actions.find(action => action.key === button.key)

              const isVisible =
                correspondingAction.condition &&
                eval(button.access ? maxAccess?.record?.accessFlags[button.access] !== false : true)

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
