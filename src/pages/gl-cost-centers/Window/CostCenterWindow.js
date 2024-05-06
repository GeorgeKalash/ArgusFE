// ** Custom Imports
import Window from 'src/components/Shared/Window'
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
    >
      <CostCenterForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
        onSubmit={onSubmit}
      />
    </Window>
  )
}

export default CostCenterWindow
