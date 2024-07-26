import { Box, Grid, Typography } from '@mui/material'

const ParamsArrayToolbar = ({ paramsArray }) => {
  return (
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
  )
}

export default ParamsArrayToolbar
