import { useContext } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ClearGridConfirmation = ({ window, onConfirm, fullScreen, open, dialogText }) => {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Clear, window })

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
      height='140px'
    />
  )
}
ClearGridConfirmation.width = 570
ClearGridConfirmation.height = 170

export default ClearGridConfirmation
