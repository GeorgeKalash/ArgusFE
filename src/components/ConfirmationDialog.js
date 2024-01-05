// ** MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material'

    const ConfirmationDialog = ({
        openCondition,
        closeCondition,
        DialogText,
        okButtonAction,
        cancelButtonAction
    }) => {
        return (
        <Dialog
            open={openCondition}
            onClose={closeCondition}
            fullWidth={true}
            maxWidth="xs"
        >
            <DialogTitle>Confirmation</DialogTitle>
            <DialogContent>
            <DialogContentText>{DialogText}</DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={okButtonAction} color="primary">
                OK
            </Button>
            <Button onClick={cancelButtonAction} color="primary">
                Cancel
            </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;
