import ConfirmationDialog from '../ConfirmationDialog'

const SuccessDialog = ({ window, fullScreen, open, message }) => {
  return (
    <ConfirmationDialog
      open={open[0] ? open[0] : false}
      DialogText={message}
      okButtonAction={() => window.close()}
      fullScreen={fullScreen}
      cancelButtonAction={() => window.close()}
    />
  )
}

export default SuccessDialog
