import { Box, Button, Grid, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'
import { useState, useEffect, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import PreviewReport from './PreviewReport'
import { useWindow } from 'src/windows'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomComboBox from '../Inputs/CustomComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'

const GridToolbar = ({
  initialLoad,
  onAdd,
  onTree,
  refreshGrid,
  disableRPB = false,
  onGo,
  onRefresh = false,
  reportName,
  children,
  labels,
  onClear,
  inputSearch,
  search,
  onSearch,
  previewReport,
  onSearchClear,
  onGenerateReport,
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
  const [paramsArray, setParamsArray] = useState([])

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

  const openRPB = () => {
    stack({
      Component: ReportParameterBrowser,
      props: {
        reportName: reportName,
        paramsArray: paramsArray,
        setParamsArray: setParamsArray
      },
      width: 700,
      height: 500,
      title: 'Report Parameters Browser'
    })
  }

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
    let minValue = Infinity

    for (const [index, { fieldId, value }] of Object.entries(paramsArray)) {
      const numericValue = Number(fieldId)
      if (numericValue < minValue) {
        minValue = numericValue
      }
    }

    const formattedData = paramsArray
      .map(({ fieldId, value }) => `${fieldId}|${value}`)
      .reduce((acc, curr, index) => acc + (index === minValue ? `${curr}` : `^${curr}`), '')

    return formattedData
  }

  function clear() {
    setSearchValue('')
    onSearch('')
    if (onSearchClear) onSearchClear()
  }

  return (
    <Grid container spacing={4} sx={{ display: 'flex', padding: 2 }}>
      <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', pl: 2, zIndex: 0 }}>
        <Grid container spacing={4} sx={{ display: 'flex', padding: 1 }}>
          {children && children}
          {initialLoad && (
            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', py: '7px !important' }}>
              <Button onClick={initialLoad} variant='contained'>
                <Icon icon='mdi:reload' />
              </Button>
            </Grid>
          )}
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
          {onTree && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: '7px !important' }}>
              <Tooltip title={platformLabels.Tree}>
                <Button
                  onClick={onTree}
                  variant='contained'
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
                  <img src='/images/buttonsIcons/tree.png' alt={platformLabels.Tree} />
                </Button>
              </Tooltip>
            </Box>
          )}
          {reportName && (
            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', pt: '7px !important' }}>
              <Button
                onClick={openRPB}
                variant='contained'
                size='small'
                disabled={disableRPB}
                sx={{ height: !onGenerateReport ? '35px' : '42px' }}
              >
                {platformLabels.OpenRPB}
              </Button>
            </Grid>
          )}
          {onRefresh && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
              <Button variant='contained' onClick={refreshGrid}>
                {platformLabels.Refresh}
              </Button>
            </Box>
          )}
          {onGo && (
            <Grid item sx={{ display: 'flex', justifyContent: 'flex-start', pt: '7px !important' }}>
              <Button
                sx={{ height: !onGenerateReport ? '35px' : '42px' }}
                onClick={() => (searchValue ? onSearch(searchValue) : onGo(formatDataForApi(paramsArray)))}
                variant='contained'
              >
                {platformLabels.Apply}
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ display: 'flex', pl: 7, pt: 5, flexDirection: 'column' }}>
        {paramsArray && paramsArray.length > 0 && (
          <Box sx={{ pl: 2 }}>
            <Grid container spacing={0} sx={{ margin: 0, padding: 0 }}>
              {paramsArray.map((param, i) => (
                <Grid key={i} item sx={{ margin: 0, padding: 0 }}>
                  [<b>{param.caption}:</b> {param.display}]
                </Grid>
              ))}
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
      </Grid>
    </Grid>
  )
}

export default GridToolbar
