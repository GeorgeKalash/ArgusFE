// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import InterfaceTab from 'src/pages/interface/Tabs/InterfaceTab'

const InterfaceWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    interfaceValidation,
    labels,
    maxAccess
}) => {
    return (
        <Window
        id='InterfaceWindow'
        Title={labels.interface}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        interfaceValidation={interfaceValidation}
        >
             <CustomTabPanel>
               <InterfaceTab
                  labels={labels}
                  interfaceValidation={interfaceValidation}
                  editMode={editMode}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default InterfaceWindow