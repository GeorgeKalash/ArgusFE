import Window from 'src/components/Shared/Window'
import LoCollectorsForm from '../forms/LoCollectorsForm'

const LoCollectorsWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='LoCollectorsWindow' Title={labels.collector} width={500} height={350} controlled={true} onClose={onClose}>
      <LoCollectorsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default LoCollectorsWindow
