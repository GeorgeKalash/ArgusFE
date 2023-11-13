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

    return (
        <Dialog
            open={props.open[0] ? props.open[0] : false}
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
