import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { useContext } from 'react'

const ConfirmationDialog = ({
  openCondition,
  closeCondition,
  DialogText,
  okButtonAction,
  cancelButtonAction,
  fullScreen = true
}) => {
  const { platformLabels } = useContext(ControlContext)

  return !fullScreen ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '120px'
      }}
    >
      <Box
        sx={{
          flex: '1',
          overflow: 'auto',
          p: 5
        }}
      >
        {DialogText}
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          py: 1,
          px: 5,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Button onClick={okButtonAction} color='primary'>
          {platformLabels.OK}
        </Button>
        <Button onClick={cancelButtonAction} color='primary'>
          {platformLabels.Cancel}
        </Button>
      </Box>
    </Box>
  ) : (
    <Dialog open={openCondition} onClose={closeCondition} fullWidth={true} maxWidth='xs'>
      <DialogTitle>{platformLabels.Confirmation}</DialogTitle>
      <DialogContent>
        <DialogContentText>{DialogText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={okButtonAction} color='primary'>
          {platformLabels.OK}
        </Button>
        <Button onClick={cancelButtonAction} color='primary'>
          {platformLabels.Cancel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
