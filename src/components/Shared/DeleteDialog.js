import ConfirmationDialog from '../ConfirmationDialog';

const DeleteDialog = ({window, onConfirm, fullScreen, open}) => {
  return (
    <ConfirmationDialog

      open={open[0] ? open[0] : false}

      // closeCondition={window.close()} 
      DialogText="Are you sure you want to delete the selected record?"
      okButtonAction={() => {
        onConfirm(open[1]),
        window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={()=>window.close()}
      
    />
  );
};

export default DeleteDialog;
