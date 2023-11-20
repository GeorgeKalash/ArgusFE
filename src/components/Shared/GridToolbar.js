// ** MUI Imports
import { Box, Button, Grid, Typography } from '@mui/material'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'

const GridToolbar = ({ onAdd, openRPB, paramsArray, ...props }) => {
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const addBtnVisible = onAdd && maxAccess > TrxType.NOACCESS

  return (
    <Box>
      <Box sx={{ display: 'flex', pb: 2 }}>
        {addBtnVisible && (
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
      </Box>
      {(paramsArray && paramsArray.length) > 0 && (
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
