import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import DocumentsForm from '../forms/DocumentsForm'

const DocumentsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
  functionId,
  seqNo
}) => {
  
  return (
    <Window
      id='DocumentsWindow'
        Title={labels.documentOnHold}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <DocumentsForm
        onClose={onClose}
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
          functionId={functionId}
          seqNo={seqNo}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default DocumentsWindow
