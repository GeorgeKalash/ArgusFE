// ** Custom Imports
import Window from 'src/components/Shared/Window'
import DocumentTypeMapForm from '../forms/DocumentTypeMapForm'

const DocumentTypeMapWindow = ({ onClose, labels, maxAccess, recordId, fromFunctionId, fromDTId, toFunctionId }) => {
  return (
    <Window
      id='DocumentTypeMapWindow'
      Title={labels.documentTypeMap}
      controlled={true}
      onClose={onClose}
      width={600}
      height={400}
    >
      <DocumentTypeMapForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
        fromFunctionId={fromFunctionId}
        fromDTId={fromDTId}
        toFunctionId={toFunctionId}
      />
    </Window>
  )
}

export default DocumentTypeMapWindow
