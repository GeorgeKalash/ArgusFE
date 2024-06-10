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
            border: '2px solid #0111', 
            padding: '20px', 
            position: 'relative',
            marginY:'10px',
            marginLeft:'0px',
            ...props.sx
          }} >
            <Typography variant="h6" style={{
              position: 'absolute',
              fontSize:'14px',
              top: '-13px', 
              backgroundColor: '#F4F5FA', 
              padding: '0 10px', 
            }}>{title}</Typography>
                   {children}


        </Grid>
  )
}

export default FieldSet
