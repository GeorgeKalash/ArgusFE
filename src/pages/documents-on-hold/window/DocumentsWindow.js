import Window from 'src/components/Shared/Window'
import DocumentsForm from '../forms/DocumentsForm'

const DocumentsWindow = ({ onClose, labels, maxAccess, recordId, functionId, seqNo, setWindowOpen }) => {
  return (
    <Window
      id='DocumentsWindow'
      Title={labels.documentOnHold}
      controlled={true}
      onClose={onClose}
      width={500}
      height={400}
    >
      <DocumentsForm
        onClose={onClose}
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
        functionId={functionId}
        seqNo={seqNo}
        setWindowOpen={setWindowOpen}
      />
    </Window>
  )
}

export default DocumentsWindow
