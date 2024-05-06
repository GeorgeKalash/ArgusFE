// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CtRiskLevelsForm from '../forms/CtRiskLevelsForm'

const CtRiskLevelsWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='CtRiskLevelsWindow' Title={labels.riskLevel} controlled={true} onClose={onClose} width={500}>
      <CtRiskLevelsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default CtRiskLevelsWindow
