// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentBranchTab from 'src/pages/correspondent-agent-branches/Tabs/AgentBranchTab'

const AgentBranchWindow = ({
    onClose,
    width,
    height,
    onSave,
    agentBranchValidation,
    labels,
    agentStore,
    maxAccess
}) => {
    return (
        <Window
        id='AgentWindow'
        Title={labels.title}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        agentStore={agentStore}
        agentBranchValidation={agentBranchValidation}
        >
             <CustomTabPanel>
               <AgentBranchTab
                  labels={labels}
                  agentBranchValidation={agentBranchValidation}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window>
         )
    }

    export default AgentBranchWindow
