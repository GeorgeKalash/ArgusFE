import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const CancelDialog = ({ window, onConfirm, fullScreen, open }) => {
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Cancel, window })

  return (
    <ConfirmationDialog
      open={open[0] ? open[0] : false}
      DialogText={platformLabels.CancelConf}
      okButtonAction={() => {
        onConfirm(open[1]), window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => window.close()}
    />
  )
}

CancelDialog.width = 450
CancelDialog.height = 170

export default CancelDialog
