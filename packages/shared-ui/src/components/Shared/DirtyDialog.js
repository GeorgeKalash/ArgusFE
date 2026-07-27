import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const DirtyDialog = ({ window, onConfirm, fullScreen }) => {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Warning, window })

  return (
    <ConfirmationDialog
      openCondition={true}
      closeCondition={() => window.close()}
      DialogText={platformLabels.UnsavedChanges}
      okButtonAction={() => {
        onConfirm?.()
        window.close()
      }}
      cancelButtonAction={() => window.close()}
      fullScreen={false}
    />
  )
}

DirtyDialog.width = 450
DirtyDialog.height = 170

export default DirtyDialog