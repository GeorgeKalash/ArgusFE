import { ControlContext } from 'src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'

const ClearGridConfirmation = ({ window, onConfirm, fullScreen, open, dialogText }) => {
  return (
    <ConfirmationDialog
      open={open?.flag ? open?.flag : false}
      DialogText={dialogText}
      okButtonAction={() => {
        if (typeof onConfirm === 'function') {
          onConfirm()
        }
        window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => window.close()}
    />
  )
}

export default ClearGridConfirmation
