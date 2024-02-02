// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import MaterialsAdjustmentForm from '../Forms/MaterialsAdjustmentForm'

const MaterialsAdjustmentWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='MaterialsAdjustmentWindow'
      Title={labels[1]}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <MaterialsAdjustmentForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default MaterialsAdjustmentWindow
