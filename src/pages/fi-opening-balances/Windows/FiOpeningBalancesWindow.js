import Window from 'src/components/Shared/Window'
import FiOpeningBalancesForm from '../forms/FiOpeningBalancesForm'

const FiOpeningBalancesWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='FiOpeningBalancesWindow'
      Title={labels.openingBalance}
      controlled={true}
      onClose={onClose}
      width={600}
      height={600}
    >
      <FiOpeningBalancesForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default FiOpeningBalancesWindow
