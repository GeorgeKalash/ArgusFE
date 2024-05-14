// ** Custom Imports
import Window from 'src/components/Shared/Window'

import NumberRangeForm from '../forms/NumberRangeForm'

const NumberRangeWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='RelationWindow' Title={labels.numberRange} controlled={true} onClose={onClose} height={450} width={500}>
      <NumberRangeForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default NumberRangeWindow
