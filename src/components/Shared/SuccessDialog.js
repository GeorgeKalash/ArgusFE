import ConfirmationDialog from '../ConfirmationDialog'

const SuccessDialog = ({ window, fullScreen, open, message }) => {
  return (
    <ConfirmationDialog
      open={open}
      DialogText={message}
      okButtonAction={() => window.close()}
      fullScreen={fullScreen}
      cancelButtonAction={() => window.close()}
    />
  )
}

export default SuccessDialog
