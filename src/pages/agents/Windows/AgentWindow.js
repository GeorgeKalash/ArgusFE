// ** Custom Imports
import Window from 'src/components/Shared/Window'
import AgentForm from '../Forms/AgentForm'

const AgentWindow = ({ 
  onClose,
  labels,
  maxAccess,
  recordId
 }) => {
  return (
    <Window
      id='AgentWindow'
      Title={labels.agents}
      controlled={true}
      onClose={onClose}
      width={500}
    >
        <AgentForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
    </Window>
  )
}

export default AgentWindow
