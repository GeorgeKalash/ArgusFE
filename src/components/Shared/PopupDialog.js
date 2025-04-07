import { Box, Button } from '@mui/material'
import { useContext } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

const PopupDialog = ({ DialogText, window }) => {
  const { platformLabels } = useContext(ControlContext)

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '120px',
        maxHeight: `${DialogText.length}px`
      }}
    >
      <Box
        sx={{
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          mb: 2,
          flexGrow: 1
        }}
      >
        {DialogText}
      </Box>

      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={() => {
            window.close()
          }}
          color='primary'
          variant='contained'
        >
          {platformLabels?.OK}
        </Button>
      </Box>
    </Box>
  )
}

export default PopupDialog
