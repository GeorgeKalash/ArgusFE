import { Box, Button, Grid, Tooltip, DialogActions } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { useState, useContext, useEffect } from 'react'
import { TrxType } from 'src/resources/AccessLevels'
import { ControlContext } from 'src/providers/ControlContext'
import { getButtons } from './Buttons'
import CustomComboBox from '../Inputs/CustomComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import PreviewReport from './PreviewReport'

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
  const [tooltip, setTooltip] = useState('')
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportStore, setReportStore] = useState([])

  function clear() {
    setSearchValue('')
    onSearch('')
    if (onSearchClear) onSearchClear()
  }

  const handleButtonMouseEnter = text => {
    setTooltip(text)
  }

  const handleButtonMouseLeave = () => {
    setTooltip(null)
  }

  const getReportLayout = () => {
    setReportStore([])

    getRequest({
      extension: SystemRepository.ReportLayout,
      parameters: `_resourceId=${previewReport}`
    }).then(res => {
      if (res?.list) {
        const formattedReports = res.list.map(item => ({
          api_url: item.api,
          reportClass: item.instanceName,
          parameters: item.parameters,
          layoutName: item.layoutName,
          assembly: 'ArgusRPT.dll'
        }))
        setReportStore(formattedReports)
        if (formattedReports.length > 0) {
          setSelectedReport(formattedReports[0])
        }
      }
    })
  }

  useEffect(() => {
    const fetchReportLayout = async () => {
      if (previewReport) {
        await getReportLayout()
        if (reportStore.length > 0) setSelectedReport(reportStore[0])
      }
    }

    fetchReportLayout()
  }, [])

  const buttons = getButtons(platformLabels)

  return (
    <DialogActions sx={{ px: '0px !important', py: '4px !important', flexDirection: 'column' }}>
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
      <Grid container spacing={2} sx={{ display: 'flex', px: 2, width: '100%', justifyContent: 'space-between' }}>
        <Grid item>
          <Grid container spacing={2}>
            {leftSection}
            {onAdd && addBtnVisible && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Tooltip title={platformLabels.add}>
                  <Button
                    onClick={onAdd}
                    variant='contained'
                    style={{ backgroundColor: 'transparent', border: '1px solid #4eb558' }}
                    disabled={disableAdd}
                    sx={{
                      mr: 1,
                      '&:hover': {
                        opacity: 0.8
                      },
                      width: '20px',
                      height: '33px',
                      objectFit: 'contain'
                    }}
                  >
                    <img src='/images/buttonsIcons/add.png' alt={platformLabels.add} />
                  </Button>
                </Tooltip>
              </Grid>
            )}
            {inputSearch && (
              <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', m: '0px !important' }}>
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
                            width: 'auto',
                            height: '33px',
                            objectFit: 'contain'
                          }}
                          disabled={isDisabled}
                        >
                          {button.image ? (
                            <img src={`/images/buttonsIcons/${button.image}`} alt={button.key} />
                          ) : (
                            button.label
                          )}
                        </Button>
                        {button.image ? tooltip && <div className='toast'>{tooltip}</div> : null}
                      </div>
                    )
                  )
                })}
            </Grid>
          </Grid>
        </Grid>
        {previewReport && (
          <Grid item>
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <CustomComboBox
                label={platformLabels.SelectReport}
                valueField='caption'
                displayField='layoutName'
                store={reportStore}
                value={selectedReport}
                onChange={(e, newValue) => setSelectedReport(newValue)}
                sx={{ width: 250 }}
                disableClearable
              />
              <Button
                variant='contained'
                disabled={!selectedReport}
                onClick={() =>
                  stack({
                    Component: PreviewReport,
                    props: {
                      selectedReport: selectedReport,
                      outerGrid: true,
                      onSuccess: () => {}
                    },
                    width: 1000,
                    height: 500,
                    title: platformLabels.PreviewReport
                  })
                }
                sx={{
                  ml: 2,
                  backgroundColor: '#231F20',
                  '&:hover': {
                    backgroundColor: '#231F20',
                    opacity: 0.8
                  },
                  width: 'auto',
                  height: '35px',
                  objectFit: 'contain'
                }}
                size='small'
              >
                <Tooltip title={platformLabels.Preview}>
                  <img src='/images/buttonsIcons/preview.png' alt={platformLabels.Preview} />
                </Tooltip>
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Grid item>{rightSection}</Grid>
      {bottomSection}
    </DialogActions>
  )
}

export default GridToolbar
