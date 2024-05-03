// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import LoCollectorsForm from '../forms/LoCollectorsForm'

const LoCollectorsWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='LoCollectorsWindow' Title={labels.collector} controlled={true} onClose={onClose}>
      <LoCollectorsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default LoCollectorsWindow
