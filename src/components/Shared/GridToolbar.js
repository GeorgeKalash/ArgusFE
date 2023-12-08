// ** MUI Imports
import { Box, Button, Grid, Typography } from '@mui/material'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'

const GridToolbar = ({ onAdd, openRPB, onGo, paramsArray, children, ...props }) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.NOACCESS

  const formatDataForApi = paramsArray => {
    const formattedData = paramsArray.map(({ fieldId, value }) => `${fieldId}|${value}`).join('^')

    return formattedData
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', pb: 2 }}>
        {onAdd && addBtnVisible && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <Button onClick={onAdd} variant='contained'>
              Add
            </Button>
          </Box>
        )}
        {openRPB && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <Button onClick={openRPB} variant='contained'>
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
      {children && children}
    </Box>
  )
}

export default GridToolbar
