// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AgentTab from 'src/pages/correspondent-agents/Tabs/AgentTab'

const AgentWindow = ({
    onClose,
    width,
    height,
    onSave,
    agentValidation,
    labels,
    maxAccess
}) => {
    return (
        <Window
        id='AgentWindow'
        Title={labels.agents}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        agentValidation={agentValidation}
        >
             <CustomTabPanel>
               <AgentTab
                  labels={labels}
                  agentValidation={agentValidation}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default AgentWindow