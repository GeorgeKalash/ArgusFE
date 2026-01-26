import { Grid, Typography } from '@mui/material'

const FieldSet = ({ children, title, form = false, ...props }) => {
  return (
    <Grid
      container
      spacing={{ xs: 1.5, sm: 2 }}
      sx={{
        border: '1px solid',
        borderColor: '#cdd3d4',
        position: 'relative',
        ml: 0,
        my: title ? { xs: 1, sm: 1.25 } : 0,
        p: form ? 0 : { xs: 1.25, sm: 1.5 },
        pt: form ? 0 : title ? { xs: 2.25, sm: 2.5 } : { xs: 1.25, sm: 1.5 },

        ...props.sx
      }}
    >
      {!!title && (
        <Typography
          variant='h6'
          sx={{
            position: 'absolute',
            top: { xs: -10, sm: -13 },
            left: { xs: 10, sm: 12 },
            bgcolor: '#F4F5FA',
            px: { xs: 1, sm: 1.25 },
            fontSize: { xs: 11, sm: 14 },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100% - 20px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {title}
        </Typography>
      )}

      {children}
    </Grid>
  )
}

export default FieldSet
