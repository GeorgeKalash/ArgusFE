import { Grid, Typography } from '@mui/material'

const FieldSet = ({ children, title, ...props }) => {
  return (
    <Grid
      container
      spacing={2}
      xs={12}
      sx={{
        border: '1px solid #0111',
        padding: '10px',
        paddingTop: title ? '20px' : '10px',
        position: 'relative',
        marginY: title ? '10px' : '0px',
        marginLeft: '0px',
        borderColor: '#cdd3d4',
        ...props.sx
      }}
    >
      <Typography
        variant='h6'
        style={{
          position: 'absolute',
          fontSize: '14px',
          top: '-13px',
          backgroundColor: '#F4F5FA',
          padding: '0 10px'
        }}
      >
        {title}
      </Typography>
      {children}
    </Grid>
  )
}

export default FieldSet
