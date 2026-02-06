import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const DeleteDialog = ({ window, onConfirm, fullScreen, open }) => {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Delete, window })

  return (
    <ConfirmationDialog
      open={open[0] ? open[0] : false}
      DialogText={platformLabels.DeleteConf}
      okButtonAction={() => {
        onConfirm(open[1]), window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => window.close()}
    />
  )
}
DeleteDialog.width = 450
DeleteDialog.height = 170

export default DeleteDialog
