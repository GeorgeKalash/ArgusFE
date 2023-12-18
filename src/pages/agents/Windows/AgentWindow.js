// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentTab from 'src/pages/agents/Tabs/AgentTab'

const AgentWindow = ({ onClose, width, height, onSave, agentValidation, labels, countryStore, maxAccess }) => {
  return (
    <Window
      id='AgentWindow'
      Title={labels.agents}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      countryStore={countryStore}
      agentValidation={agentValidation}
    >
      <CustomTabPanel>
        <AgentTab labels={labels} countryStore={countryStore} agentValidation={agentValidation} maxAccess={maxAccess} />
      </CustomTabPanel>
    </Window>
  )
}

export default AgentWindow
