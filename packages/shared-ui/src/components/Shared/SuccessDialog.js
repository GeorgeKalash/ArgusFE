import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const SuccessDialog = ({ window, fullScreen, open, message }) => {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Success, window })

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

SuccessDialog.width = 450
SuccessDialog.height = 170

export default SuccessDialog
