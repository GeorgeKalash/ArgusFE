import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ImportConfirmation = ({ window, onConfirm, fullScreen, open, dialogText }) => {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.import, window })

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

ImportConfirmation.width = 470
ImportConfirmation.height = 170

export default ImportConfirmation
