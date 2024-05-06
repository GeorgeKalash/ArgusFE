// ** Custom Imports
import Window from 'src/components/Shared/Window'

import NumberRangeForm from '../forms/NumberRangeForm'

const NumberRangeWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='RelationWindow' Title={labels.numberRange} controlled={true} onClose={onClose}>
      <NumberRangeForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default NumberRangeWindow
