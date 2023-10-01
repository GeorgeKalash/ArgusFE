// ** MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material'

const DeleteDialog = (props) => {
    console.log({ open: props.open[0] })

    return (
        <Dialog
            open={props.open[0]}
            onClose={props.onClose}
            fullWidth={true}
            maxWidth="xs"
        >
            <DialogTitle>Confirmation</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete the selected record ?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onConfirm(props.open[1])} color="primary">
                    OK
                </Button>
                <Button onClick={props.onClose} color="primary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteDialog;
