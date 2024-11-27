import { Box, Grid } from '@mui/material'

const NormalDialog = ({ DialogText }) => {
  console.log(DialogText, 'DialogText')

  return (
    <Grid container justifyContent='center' alignItems='center'>
      <Grid item>
        <Box textAlign='center' p={12}>
          {DialogText}
        </Box>
      </Grid>
    </Grid>
  )
}

export default NormalDialog
