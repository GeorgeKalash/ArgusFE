// ** MUI Imports
import { Box, Button, Grid, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'
import { useState } from 'react'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'

const GridToolbar = ({ initialLoad, onAdd, openRPB, disableRPB = false, onGo, paramsArray, children , labels,onClear, inputSearch,search , onSearch,onSearchClear, ...props }) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.NOACCESS
  const [searchValue , setSearchValue] = useState('')

  const formatDataForApi = paramsArray => {
    const formattedData = paramsArray.map(({ fieldId, value }) => `${fieldId}|${value}`).join('^')

    return formattedData
  }
  function clear(){
    setSearchValue('');
    onSearchClear()
    
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
            <Button onClick={onAdd} variant='contained'>
              Add
            </Button>
          </Box>
        )}
        {inputSearch && <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <CustomTextField
              name='search'
              value={searchValue}
              label={labels.search}
              onClear={clear}

              onChange={(e)=>setSearchValue(e.target.value)}
              onSearch={onSearch}
              search={true}
            />

          </Box>
          }
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


    </Box>
  )
}

export default GridToolbar
