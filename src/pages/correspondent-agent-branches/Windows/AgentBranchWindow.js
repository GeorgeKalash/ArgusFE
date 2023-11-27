// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentBranchTab from 'src/pages/correspondent-agent-branches/Tabs/AgentBranchTab'
import AddressTab from 'src/components/Shared/AddressTab'

const AgentBranchWindow = ({
  onClose,
  width,
  height,
  tabs,
  activeTab,
  setActiveTab,
  onSave,
  agentBranchValidation,
  labels,
  agentStore,
  setAgentStore,
  fillStateStore,
  fillCountryStore,
  countryStore,
  stateStore,
  maxAccess
}) => {
  return (
    <Window
      id='AgentWindow'
      Title={labels.title}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      agentBranchValidation={agentBranchValidation}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <AgentBranchTab
          labels={labels}
          setAgentStore={setAgentStore}
          agentBranchValidation={agentBranchValidation}
          maxAccess={maxAccess}
          agentStore={agentStore}
        />
      </CustomTabPanel>

      <CustomTabPanel index={1} value={activeTab}>
        <AddressTab
          countryStore={countryStore}
          stateStore={stateStore}
          labels={labels}
          fillStateStore={fillStateStore}
          fillCountryStore={fillCountryStore}
          addressValidation={agentBranchValidation}
          maxAccess={maxAccess}
          agentStore={agentStore}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default AgentBranchWindow
