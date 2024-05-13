// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CostCenterGroupForm from '../forms/CostCenterGroupForm'

const CostCenterGroupWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='CostCenterGroupWindow'
      Title={labels.costCenter}
      controlled={true}
      onClose={onClose}
      width={500}
      height={350}
    >
      <CostCenterGroupForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default CostCenterGroupWindow
