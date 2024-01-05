
import ConfirmationDialog from '../ConfirmationDialog';

const DeleteDialog = (props) => {

    return (
        <ConfirmationDialog
        openCondition={props.open[0] ? props.open[0] : false}
        closeCondition={props.onClose}
        DialogText={"Are you sure you want to delete the selected record?"}
        okButtonAction={() => props.onConfirm(props.open[1])}
        cancelButtonAction={props.onClose}
      />
        
    );
}

export default DeleteDialog;
