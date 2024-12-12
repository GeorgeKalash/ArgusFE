import { Grid, Typography } from '@mui/material'

const FieldSet = ({ children, title, ...props }) => {
  return (
    <Grid
      container
      spacing={2}
      xs={12}
      sx={{
        border: '2px solid #0111',
        padding: '10px',
        paddingTop: '15px',
        position: 'relative',
        marginY: '10px',
        marginLeft: '0px',
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
