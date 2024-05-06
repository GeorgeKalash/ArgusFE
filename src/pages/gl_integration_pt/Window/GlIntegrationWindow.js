import Window from 'src/components/Shared/Window'
import GlIntegrationForm from '../forms/GlIntegrationForm'

const GlIntegrationWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='GlIntegrationWindow' Title={labels.postType} controlled={true} onClose={onClose}>
      <GlIntegrationForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default GlIntegrationWindow
