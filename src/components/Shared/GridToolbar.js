// ** MUI Imports
import { Box, Button, Grid, Tooltip, Typography, Autocomplete, DialogActions, TextField } from '@mui/material'

import Icon from 'src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'
import { useState, useEffect, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

import PreviewReport from './PreviewReport'
import { useWindow } from 'src/windows'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'
import { SystemRepository } from 'src/repositories/SystemRepository'

const GridToolbar = ({
  initialLoad,
  onAdd,
  openRPB,
  disableRPB = false,
  onGo,
  paramsArray,
  children,
  labels,
  onClear,
  inputSearch,
  search,
  onSearch,

  previewReport,
  onSearchClear,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.GET
  const [searchValue, setSearchValue] = useState('')
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportStore, setReportStore] = useState([])

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
        .catch(error => {
          console.error(error)
        })
    }
  }

  const formatDataForApi = paramsArray => {
    const formattedData = paramsArray.map(({ fieldId, value }) => `${fieldId}|${value}`).join('^')

    return formattedData
  }
  function clear() {
    setSearchValue('')
    onSearch('')
  }

  return (
    <Box display={'flex'} sx={{ justifyContent: 'space-between' }}>
      {children && children}
      <Box sx={{ display: 'flex', pb: 2, pr: 2 }}>
        {initialLoad && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <Button onClick={initialLoad} variant='contained'>
              <Icon icon='mdi:reload' />
            </Button>
          </Box>
        )}
        {onAdd && addBtnVisible && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <Tooltip title='Add'>
              <Button
                onClick={onAdd}
                variant='contained'
                style={{ backgroundColor: 'transparent', border: '1px solid #4eb558' }}
              >
                <img src='/images/buttonsIcons/add.png' alt='Add' />
              </Button>
            </Tooltip>
          </Box>
        )}

        {inputSearch && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2, zIndex: 0 }}>
            <CustomTextField
              name='search'
              value={searchValue}
              label={labels.search}
              onClear={clear}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={onSearch}
              search={true}
            />
          </Box>
        )}
        {openRPB && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <Button onClick={openRPB} variant='contained' disabled={disableRPB}>
              OPEN RPB
            </Button>
          </Box>
        )}
        {onGo && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <Button
              disabled={paramsArray.length === 0}
              onClick={() => onGo({ _startAt: 0, _pageSize: 30, params: formatDataForApi(paramsArray) })}
              variant='contained'
            >
              GO
            </Button>
          </Box>
        )}
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
        <Box sx={{ display: 'flex', alignItems: 'center', paddingRight: '2rem' }}>
          <Autocomplete
            size='small'
            options={reportStore}
            value={selectedReport}
            getOptionLabel={option => option.layoutName || option.caption || ''}
            onChange={(e, newValue) => setSelectedReport(newValue)}
            renderInput={params => (
              <TextField {...params} label='Select a report template' variant='outlined' fullWidth />
            )}
            sx={{ width: 250, zIndex: 0 }}
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
                title: 'Preview Report'
              })
            }
            size='small'
          >
            <Tooltip title='Preview'>
              <img src='/images/buttonsIcons/preview.png' alt='Preview' />
            </Tooltip>
          </Button>
        </Box>
      ) : (
        <Box></Box>
      )}
    </Box>
  )
}

export default GridToolbar
