// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CostCenterForm from '../forms/CostCenterForm'

const CostCenterWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
  onSubmit
}) => {
  
  return (
    <Window
      id='CostCenterWindow'
      Title={labels.costCenter}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <CostCenterForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
          onSubmit={onSubmit}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default CostCenterWindow
