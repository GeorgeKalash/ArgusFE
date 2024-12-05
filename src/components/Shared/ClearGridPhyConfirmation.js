import { ControlContext } from 'src/providers/ControlContext'
import ConfirmationDialog from '../ConfirmationDialog'
import { useContext } from 'react'

const ClearGridPhyConfirmation = ({ window, onConfirm, fullScreen, open }) => {
  const { platformLabels } = useContext(ControlContext)

  return (
    <ConfirmationDialog
      open={open[0] ? open[0] : false}
      DialogText={platformLabels.DeleteGridConf}
      okButtonAction={() => {
        onConfirm(open[1]), window.close()
      }}
      fullScreen={fullScreen}
      cancelButtonAction={() => window.close()}
    />
  )
}

export default ClearGridPhyConfirmation
