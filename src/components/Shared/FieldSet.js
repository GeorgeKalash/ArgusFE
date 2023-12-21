// ** MUI Imports
import {  Grid, Box, Typography } from '@mui/material'


import { useSettings } from 'src/@core/hooks/useSettings'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'

const FieldSet = ({
  children,
 title,
  ...props
}) => {


  return (



       <Grid container  spacing={2} sx={{
            border: '2px solid #0111', // Set the border width and color
            padding: '20px', // Adjust padding as needed
            position: 'relative',
            margin:'10px',

          }} >
            <Typography variant="h6" style={{
              position: 'absolute',
              top: '-15px', // Adjust as needed to control the distance from the border
              backgroundColor: '#fff', // Set the background color to match the container
              padding: '0 10px', // Adjust as needed
            }}>{title}</Typography>
                   {children}


        </Grid>
  )
}

export default FieldSet
