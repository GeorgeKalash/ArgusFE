// ** Custom Imports
import Window from 'src/components/Shared/Window'

import ActivityForm from '../forms/ActivityForm'

const ActivityWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='ActivityWindow' Title={labels.Activity} controlled={true} onClose={onClose} width={500} height={400}>
      <ActivityForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default ActivityWindow
