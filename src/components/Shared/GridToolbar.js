import { Grid, DialogActions } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { useState, useContext, useEffect } from 'react'
import { TrxType } from 'src/resources/AccessLevels'
import { ControlContext } from 'src/providers/ControlContext'
import { getButtons } from './Buttons'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ReportGenerator from './ReportGenerator'
import CustomButton from '../Inputs/CustomButton'

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
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.GET
  const { getRequest } = useContext(RequestsContext)
  const [searchValue, setSearchValue] = useState('')
  const { platformLabels } = useContext(ControlContext)
  const [reportStore, setReportStore] = useState([])
  const [zoomSpacing, setZoomSpacing] = useState(2)

  useEffect(() => {
    const updateZoomSpacing = () => {
      const zoom = parseFloat(getComputedStyle(document.body).getPropertyValue('--zoom')) || 1
      setZoomSpacing(zoom === 1 ? 2 : 5)
    }

    updateZoomSpacing()
    window.addEventListener('resize', updateZoomSpacing)

    return () => window.removeEventListener('resize', updateZoomSpacing)
  }, [])

  const clear = () => {
    setSearchValue('')
    onSearch('')
    if (onSearchClear) onSearchClear()
  }

  const getReportLayout = async setReport => {
    setReportStore([])

    await getRequest({
      extension: SystemRepository.ReportLayout,
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

  return (
    <DialogActions sx={{ px: '0px !important', py: '4px !important', flexDirection: 'column' }}>
      <Grid container spacing={2} sx={{ display: 'flex', px: 2, width: '100%', justifyContent: 'space-between' }}>
        <Grid item xs={previewReport ? 6 : 9}>
          <Grid container spacing={zoomSpacing}>
            {leftSection}
            {onAdd && addBtnVisible && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <CustomButton
                  onClick={onAdd}
                  style={{ border: '1px solid #4eb558' }}
                  color={'transparent'}
                  disabled={disableAdd}
                  image={'add.png'}
                />
              </Grid>
            )}
            {inputSearch && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', mt: '1px !important' }}>
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
            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', m: '0px !important' }}>
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
