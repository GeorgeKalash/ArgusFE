import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ApprovalsDialog = ({ window, w, responseValue, onConfirm, fullScreen }) => {
  const { platformLabels } = useContext(ControlContext)
  useSetWindow({ title: platformLabels.Confirmation, window })

  return (
    <ConfirmationDialog
      DialogText={responseValue === 2 ? platformLabels.ApproveDoc : platformLabels.RejectDoc}
      okButtonAction={() => {
        onConfirm()
        window.close()
        w.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => {
        window.close()
      }}
    />
  )
}

ApprovalsDialog.width = 450
ApprovalsDialog.height = 170

export default ApprovalsDialog
