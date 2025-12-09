import { Button, Box } from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useContext } from 'react'

const PopupDialog = ({ DialogText, window }) => {
  const { platformLabels } = useContext(ControlContext)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100vh',
        p: 3,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: 0
        }}
      >
        {DialogText}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          pt: 2,
          flexShrink: 0
        }}
      >
        <Button onClick={() => window.close()} color='primary'>
          {platformLabels.OK}
        </Button>
      </Box>
    </Box>
  )
}
PopupDialog.width = 550
PopupDialog.height = 250

export default PopupDialog
