// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import InterfaceForm from '../forms/InterfaceForm'

const InterfaceWindow = ({
    onClose,
    labels,
    maxAccess,
    recordId
}) => {
    return (
        <Window
        id='InterfaceWindow'
        Title={labels.interface}
        controlled={true}
        onClose={onClose}
        width={500} //600,400
        height={300}
        >
             <CustomTabPanel>
               <InterfaceForm
                  labels={labels}
                  recordId={recordId}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default InterfaceWindow