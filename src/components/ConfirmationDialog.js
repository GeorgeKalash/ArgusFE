import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { useContext } from 'react'

const ConfirmationDialog = ({
  openCondition,
  closeCondition,
  DialogText,
  okButtonAction,
  fullScreen = true,
  window,
  height = '120px',
  ...props
}) => {
  const { platformLabels } = useContext(ControlContext)

  return !fullScreen ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: height,
        zIndex: 2
      }}
    >
      <Box
        sx={{
          flex: '1',
          overflow: 'hidden',
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
        <Button
          onClick={() => {
            okButtonAction(window)
            if (props?.close) window.close()
          }}
          color='primary'
        >
          {platformLabels.OK}
        </Button>
      </Box>
    </Box>
  ) : (
    <Dialog sx={{ zIndex: 2 }} open={openCondition} onClose={closeCondition} fullWidth={true} maxWidth='xs'>
      <DialogTitle>{platformLabels.Confirmation}</DialogTitle>
      <DialogContent>
        <DialogContentText>{DialogText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={okButtonAction} color='primary'>
          {platformLabels.OK}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
