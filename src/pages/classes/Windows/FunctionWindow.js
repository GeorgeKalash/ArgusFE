import FunctionForm from '../forms/FunctionForm'

const FunctionWindow = ({
  recordId,
  labels,
  maxAccess,
  getFunctionGridData,
  editMode,
  functionId
}) => {

  return (
    <FunctionForm
      labels={labels}
      maxAccess={maxAccess}
      recordId={recordId}
      getFunctionGridData={getFunctionGridData}
      editMode={editMode}
      functionId={functionId}
    />
  )
}

export default FunctionWindow
