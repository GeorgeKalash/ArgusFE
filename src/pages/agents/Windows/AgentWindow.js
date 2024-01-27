// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentTab from 'src/pages/agents/Tabs/AgentTab'

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
      onClose={onClose}
      width={600}
      height={400}
    >
      <CustomTabPanel>
        <AgentTab
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default AgentWindow
