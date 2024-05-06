import Window from 'src/components/Shared/Window'
import PurposeOfExchangeForm from '../forms/PurposeOfExchangeForm'

const PurposeOfExchangeWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='PurposeOfExchangeWindow'
      Title={labels.purposeOfExchange}
      controlled={true}
      onClose={onClose}
      width={500}
    >
      <PurposeOfExchangeForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default PurposeOfExchangeWindow
