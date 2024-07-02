import Window from 'src/components/Shared/Window'
import DocumentsForm from '../forms/DocumentsForm'

const DocumentsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
  functionId,
  seqNo,
  setWindowOpen,
  searchValue,
  setGridData,

  search
}) => {
  return (
    <Window
      id='DocumentsWindow'
      Title={labels.documentOnHold}
      controlled={true}
      onClose={onClose}
      height={400}
      width={500}
    >
      <DocumentsForm
        onClose={onClose}
        searchValue={searchValue}
        search={search}
        setGridData={setGridData}
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
