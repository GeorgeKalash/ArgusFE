import Window from 'src/components/Shared/Window'
import RateTypesForm from '../forms/RateTypesForm'

const RateTypesWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='RateTypesWindow' Title={labels.rateType} controlled={true} onClose={onClose}>
      <RateTypesForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default RateTypesWindow
