import { ControlContext } from 'src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'

const ApprovalsDialog = ({ window, responseValue, onConfirm, fullScreen }) => {
  const { platformLabels } = useContext(ControlContext)

  return (
    <ConfirmationDialog
      DialogText={responseValue === 2 ? platformLabels.ApproveDoc : platformLabels.RejectDoc}
      okButtonAction={() => {
        onConfirm()
        window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => {
        window.close()
      }}
    />
  )
}

export default ApprovalsDialog
