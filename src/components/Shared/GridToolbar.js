// ** MUI Imports
import { Box, Button, Grid, Tooltip, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'
import React, { useState } from 'react'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'

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
  onSearchClear,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.GET
  const [searchValue, setSearchValue] = useState('')

  const formatDataForApi = paramsArray => {
    const formattedData = paramsArray.map(({ fieldId, value }) => `${fieldId}|${value}`).join('^')

    return formattedData
  }
  function clear() {
    setSearchValue('')
    onSearch('')
  }

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <Box display={'flex'} justifyContent={'space-between'}>
        <Box>{children && children}</Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
          {initialLoad && (
            <Button onClick={initialLoad} variant='contained'>
              <Icon icon='mdi:reload' />
            </Button>
          )}
          {onAdd && addBtnVisible && (
            <Tooltip title='Add'>
              <Button
                onClick={onAdd}
                variant='contained'
                style={{ backgroundColor: 'transparent', border: '1px solid #4eb558' }}
              >
                <img src='/images/buttonsIcons/add.png' alt='Add' />
              </Button>
            </Tooltip>
          )}
          {inputSearch && (
            <CustomTextField
              name='search'
              value={searchValue}
              label={labels.search}
              onClear={clear}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={onSearch}
              search={true}
            />
          )}
          {openRPB && (
            <Button onClick={openRPB} variant='contained' disabled={disableRPB}>
              OPEN RPB
            </Button>
          )}
          {onGo && (
            <Button
              disabled={paramsArray.length === 0}
              onClick={() => onGo({ params: formatDataForApi(paramsArray) })}
              variant='contained'
            >
              GO
            </Button>
          )}
        </Box>
      </Box>
      {paramsArray && paramsArray.length > 0 && (
        <Box sx={{ pl: 2 }}>
          <Grid container spacing={0} sx={{ margin: 0, padding: 0 }}>
            {paramsArray.map((param, i) => (
              <Grid key={i} item sx={{ margin: 0, padding: 0 }}>
                [<b>{param.caption}:</b>
                {param.display}]
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default GridToolbar
