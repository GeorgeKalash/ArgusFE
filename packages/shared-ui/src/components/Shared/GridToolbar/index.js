import { Grid, DialogActions } from '@mui/material'
import CustomTextField from '../../Inputs/CustomTextField'
import { useState, useContext } from 'react'
import { accessMap, TrxType } from '@argus/shared-domain/src/resources/AccessLevels'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { getButtons } from '../Buttons'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import styles from './GridToolbar.module.css'
import ReportGenerator from '../ReportGenerator'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const GridToolbar = ({
  onAdd,
  leftSection,
  rightSection,
  bottomSection,
  middleSection,
  inputSearch,
  onSearch,
  onSearchClear,
  onSearchChange,
  disableAdd = false,
  actions = [],
  previewReport,
  disableActionsPadding, 
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess?.record?.accessFlags
  const addBtnVisible = onAdd && maxAccess && maxAccess[accessMap[TrxType.ADD]]

  const { getRequest } = useContext(RequestsContext)
  const [searchValue, setSearchValue] = useState('')
  const { platformLabels } = useContext(ControlContext)
  const [reportStore, setReportStore] = useState([])

  const clear = () => {
    setSearchValue('')
    onSearch('')
    if (onSearchClear) onSearchClear()
  }

  const getReportLayout = async setReport => {
    setReportStore([])

    await getRequest({
      extension: SystemRepository.ReportLayout.qry,
      parameters: `_resourceId=${previewReport}`
    }).then(res => {
      if (res?.list) {
        const formattedReports = res.list.map(item => ({
          api_url:
            item.api.includes('_params=') && props?.reportParams
              ? item.api.replace('_params=', `_params=${props.reportParams}`)
              : item.api,
          reportClass: item.instanceName,
          parameters: item.parameters,
          layoutName: item.layoutName,
          assembly: 'ArgusRPT.dll'
        }))
        setReportStore(formattedReports)
        if (formattedReports.length > 0) {
          setReport(prev => ({
            ...prev,
            selectedReport: formattedReports[0]
          }))
        }
      }
    })
  }

  const buttons = getButtons(platformLabels)
  
  const actionButtonsClassName = [
    styles.actionButtonsWrapper,
    disableActionsPadding && styles.actionButtonsWrapperNoPadding
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <DialogActions className={styles.dialogActions}>
      <Grid container spacing={2} className={styles.gridContainer}>
        <Grid item xs={previewReport ? 6 : 9}>
          <Grid container spacing={2}>
            {onAdd && addBtnVisible && (
              <Grid item className={styles.buttonWrapper}>
                <CustomButton
                  onClick={onAdd}
                  color={'transparent'}
                  disabled={disableAdd}
                  image={'add.png'}
                  border='1px solid #4eb558'
                />
              </Grid>
            )}

            {leftSection}

            {inputSearch && (
              <Grid item className={styles.searchFieldWrapper}>
                <CustomTextField
                  name='search'
                  value={searchValue}
                  label={platformLabels.Search}
                  onClear={clear}
                  onChange={e => {
                    setSearchValue(e.target.value)
                    if (onSearchChange) onSearchChange(e.target.value)
                  }}
                  onSearch={onSearch}
                  search={true}
                />
              </Grid>
            )}

            {middleSection}
            <Grid item className={actionButtonsClassName}>

       
            {buttons
                .filter(button => actions.some(action => action.key === button.key))
                .map((button, index) => {
                  const correspondingAction = actions.find(action => action.key === button.key)
                  const isVisible = correspondingAction.condition
                  const isDisabled = correspondingAction.disabled
                  const handleClick = correspondingAction.onClick

                  return (
                    isVisible && (
                      <CustomButton
                        key={button.key || index}
                        onClick={handleClick}
                        image={button.image}
                        tooltip={button.label}
                        label={button.label}
                        disabled={isDisabled}
                      />
                    )
                  )
                })}
            </Grid>
          </Grid>
        </Grid>

        {previewReport && (
          <ReportGenerator
            getReportLayout={getReportLayout}
            previewReport={previewReport}
            condition={props?.reportParams}
            reportStore={reportStore}
          />
        )}

        <Grid item xs={3}>
          {rightSection}
        </Grid>
      </Grid>

      {bottomSection}
    </DialogActions>
  )
}

export default GridToolbar
