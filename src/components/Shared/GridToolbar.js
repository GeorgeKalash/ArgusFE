import { Box, Button, Grid, Tooltip, Typography, DialogActions } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'
import { useState, useEffect, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import PreviewReport from './PreviewReport'
import { useWindow } from 'src/windows'
import { TrxType } from 'src/resources/AccessLevels'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomComboBox from '../Inputs/CustomComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { getButtons } from './Buttons'

const GridToolbar = ({
  initialLoad,
  onAdd,
  paramsArray,
  children,
  labels,
  onClear,
  inputSearch,
  search,
  onSearch,
  previewReport,
  onSearchClear,
  actions = [],
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.GET
  const [searchValue, setSearchValue] = useState('')
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportStore, setReportStore] = useState([])
  const [tooltip, setTooltip] = useState('')

  const functionMapping = {
    actions
  }
  useEffect(() => {
    getReportLayout()
  }, [previewReport])

  useEffect(() => {
    if (reportStore.length > 0) {
      setSelectedReport(reportStore[0])
    } else {
      setSelectedReport(null)
    }
  }, [reportStore])

  const getReportLayout = () => {
    setReportStore([])
    if (previewReport) {
      var parameters = `_resourceId=${previewReport}`
      getRequest({
        extension: SystemRepository.ReportLayout,
        parameters: parameters
      })
        .then(res => {
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
        .catch(error => {})
    }
  }

  const formatDataForApi = paramsArray => {
    const formattedData = paramsArray.map(({ fieldId, value }) => `${fieldId}|${value}`).join('^')

    return formattedData
  }
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
        <Grid container spacing={4} sx={{ display: 'flex', padding: 1 }}>
          {children && children}
          {onAdd && addBtnVisible && (
            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', pt: '7px !important' }}>
              <Tooltip title={platformLabels.add}>
                <Button
                  onClick={onAdd}
                  variant='contained'
                  style={{ backgroundColor: 'transparent', border: '1px solid #4eb558' }}
                  sx={{
                    mr: 1,
                    '&:hover': {
                      opacity: 0.8
                    },
                    width: '20px',
                    height: '35px',
                    objectFit: 'contain'
                  }}
                >
                  <img src='/images/buttonsIcons/add.png' alt={platformLabels.add} />
                </Button>
              </Tooltip>
            </Grid>
          )}
          {inputSearch && (
            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', pt: '7px !important' }}>
              <CustomTextField
                name='search'
                value={searchValue}
                label={platformLabels.Search}
                onClear={clear}
                onChange={e => setSearchValue(e.target.value)}
                onSearch={onSearch}
                search={true}
                height={35}
              />
            </Grid>
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
                          mt: 1,
                          mr: 1,
                          backgroundColor: button.color,
                          '&:hover': {
                            backgroundColor: button.color,
                            opacity: 0.8
                          },
                          border: button.border,
                          width: 'auto',
                          height: '35px',
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
          </Box>
        </Grid>
      </Box>
      {paramsArray && paramsArray.length > 0 && (
        <Box sx={{ pl: 2 }}>
          <Grid container>
            {paramsArray.map((param, i) => {
              return (
                <Grid key={i} item xs={6}>
                  <Typography>{`${param.caption}: ${param.display}`}</Typography>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}
      {previewReport ? (
        <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', py: '7px !important' }}>
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
            sx={{ ml: 2 }}
            variant='contained'
            disabled={!selectedReport}
            onClick={() =>
              stack({
                Component: PreviewReport,
                props: {
                  selectedReport: selectedReport
                },
                width: 1000,
                height: 500,
                title: platformLabels.PreviewReport
              })
            }
            size='small'
          >
            <Tooltip title={platformLabels.Preview}>
              <img src='/images/buttonsIcons/preview.png' alt={platformLabels.Preview} />
            </Tooltip>
          </Button>
        </Grid>
      ) : (
        <Box></Box>
      )}
    </DialogActions>
  )
}

export default GridToolbar
