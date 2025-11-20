// ** Custom Imports
import Window from '@argus/shared-ui/src/components/Shared/Window'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import MaterialsAdjustmentForm from '../Forms/MaterialsAdjustmentForm'

const MaterialsAdjustmentWindow = ({ onClose, labels, maxAccess, recordId, setErrorMessage }) => {
  console.log('pass window')

  return (
    <Window id='MaterialsAdjustmentWindow' Title={labels[1]} controlled={true} onClose={onClose}>
      <MaterialsAdjustmentForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
        setErrorMessage={setErrorMessage}
      />
    </Window>
  )
}

export default MaterialsAdjustmentWindow
