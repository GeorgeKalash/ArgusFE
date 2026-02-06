import { Grid, Typography } from '@mui/material'

const FieldSet = ({ children, title, form = false, ...props }) => {
  return (
    <Grid
      container
      spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
      sx={{
        border: '1px solid',
        borderColor: '#cdd3d4',
        position: 'relative',
        ml: 0,
        my: title ? { xs: 0.75, sm: 1, md: 1.25 } : 0,
        p: form ? 0 : 'clamp(8px, 0.8vw, 14px)',
        pt: form
          ? 0
          : title
            ? 'clamp(14px, 1.2vw, 22px)'
            : 'clamp(8px, 0.8vw, 14px)',
        ...props.sx
      }}
    >
      {!!title && (
        <Typography
          variant='h6'
          sx={{
            position: 'absolute',
            top: 'clamp(-12px, -0.9vw, -8px)',
            left: 'clamp(10px, 1vw, 14px)',
            bgcolor: '#F4F5FA',
            px: 'clamp(6px, 0.7vw, 12px)',
            py: 'clamp(1px, 0.2vw, 3px)',
            fontSize: 'clamp(10px, 0.75vw, 14px)',
            lineHeight: 1.2,
            fontWeight: 600,
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
