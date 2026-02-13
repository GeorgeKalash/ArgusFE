import { DialogContent, Grid } from '@mui/material'

export default function CustomJsonFormat({
  value,
  height = 'clamp(180px, 34vh, 520px)'
}) {
  return (
    <DialogContent sx={{ overflow: 'auto', p: { xs: 1.5, sm: 2 } }}>
      <Grid
        item
        sx={{
          width: '100%',
          height,
          overflow: 'auto',
          px: { xs: 1, sm: 1.5 }
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: 'inherit',
            fontWeight: 500,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {JSON.stringify(value ?? {}, null, 2)}
        </pre>
      </Grid>
    </DialogContent>
  )
}
