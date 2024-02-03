// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import MaterialsAdjustmentForm from '../Forms/MaterialsAdjustmentForm'

const MaterialsAdjustmentWindow = ({ onClose, labels, maxAccess, recordId, setErrorMessage }) => {
  return (
    <Window
      id='MaterialsAdjustmentWindow'
      Title={labels[1]}
      controlled={true}
      onClose={onClose}
      width={900}
      height={600}
      setErrorMessage={setErrorMessage}
    >
      <CustomTabPanel>
        <MaterialsAdjustmentForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
    </Window>
  )
}

export default MaterialsAdjustmentWindow
