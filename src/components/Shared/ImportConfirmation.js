import ConfirmationDialog from '../ConfirmationDialog'

const ImportConfirmation = ({ window, onConfirm, fullScreen, open, dialogText }) => {
  return (
    <ConfirmationDialog
      open={open?.flag || false}
      DialogText={dialogText}
      okButtonAction={() => {
        if (typeof onConfirm === 'function') {
          onConfirm()
        }
        window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => window.close()}
      height='140px'
    />
  )
}

export default ImportConfirmation
