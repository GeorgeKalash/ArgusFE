// ** MUI Imports
import { Dialog, DialogActions, DialogContent, DialogContentText, Button } from '@mui/material'

const ReferenceDialog = ({ openCondition, okButtonAction, DialogText }) => {
  return (
    <Dialog open={openCondition} fullWidth={true} maxWidth='xs'>
      <DialogContent>
        <DialogContentText>{DialogText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={okButtonAction} color='primary'>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ReferenceDialog
