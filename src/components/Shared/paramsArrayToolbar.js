import { Box, Grid } from '@mui/material'

const ParamsArrayToolbar = ({ paramsArray }) => {
  return (
    <Grid container spacing={2} sx={{ display: 'flex', px: 2, width: '100%' }}>
      {paramsArray.map((param, i) => (
        <Grid key={i} item>
          [<b>{param.caption}:</b> {param.display}]
        </Grid>
      ))}
    </Grid>
  )
}

export default ParamsArrayToolbar
