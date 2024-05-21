import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material'
import Window from './Shared/Window'

const ConfirmationDialog = ({
  openCondition,
  closeCondition,
  DialogText,
  okButtonAction,
  cancelButtonAction,
  fullScreen = true
}) => {
  return !fullScreen ? (
    openCondition && (
      <Window Title='Confirmation' width={450} height={120} canExpand={false} onClose={closeCondition}>

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
              OK
            </Button>
            <Button onClick={cancelButtonAction} color='primary'>
              Cancel
            </Button>
          </Box>
        </Box>

      // </Window>
    // )
  ) : (
    <Dialog open={openCondition} onClose={closeCondition} fullWidth={true} maxWidth='xs'>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>{DialogText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={okButtonAction} color='primary'>
          OK
        </Button>
        <Button onClick={cancelButtonAction} color='primary'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
