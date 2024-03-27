// ** Custom Imports
import Window from 'src/components/Shared/Window'

// **Tabs
import DocumentTypeForm from 'src/pages/document-types/forms/DocumentTypeForm'


const DocumentTypeWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
    return (
        <>
        <Window 
            id='DocumentTypeWindow' 
            Title={labels.DocumentType} 
            controlled={true} 
            onClose={onClose} 
            width={600}
            height={460} 
        >
            <DocumentTypeForm
                labels={labels}
                maxAccess={maxAccess}
                recordId={recordId}  
            />
        </Window>
    </>
  )
}

export default DocumentTypeWindow
