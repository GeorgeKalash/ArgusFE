import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DialogContent, Grid } from '@mui/material'
import { useContext } from 'react'

function DataForm({ data, window }) {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.data, window })

  return (
    <DialogContent
      sx={{p: 0}}
    >
      <Grid
        item
        sx={{
          width: '100%',
          minHeight: 'clamp(180px, 34vh, 520px)',
          maxHeight: 'clamp(180px, 34vh, 520px)',
          p: { xs: 1, sm: 1.5 },
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 'clamp(11px, 0.95vw, 14px)',
            lineHeight: 'clamp(1.25, 1.2vw, 1.5)'
          }}
        >
          {JSON.stringify(data ?? {}, null, 2)}
        </pre>
      </Grid>
    </DialogContent>
  )
}

DataForm.width = 600
DataForm.height = 390

export default DataForm
