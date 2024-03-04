// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import DocumentTypeMapForm from '../forms/DocumentTypeMapForm'

const DocumentTypeMapWindow = ({
    onClose,
    labels,
    maxAccess,
    recordId,
    fromFunctionId,
    fromDTId,
    toFunctionId
          
}) => {
    return (
        <Window
        id='DocumentTypeMapWindow'
        Title={"labels.DocumentTypeMap"}
        controlled={true}
        onClose={onClose}
        width={600}
        height={400}
        >
             <CustomTabPanel>
               <DocumentTypeMapForm
                  labels={labels}
                  maxAccess={maxAccess}
                  recordId={recordId}
                  fromFunctionId={fromFunctionId}
                  fromDTId={fromDTId}
                  toFunctionId={toFunctionId}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default DocumentTypeMapWindow