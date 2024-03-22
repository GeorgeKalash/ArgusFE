import NewValueForm from '../forms/NewValueForm'

const ValuesWindow = ({
  recordId,
  labels,
  maxAccess,
  seqNo,
  chId,
  getValueGridData,
  edit
}) => {

  return (
    <NewValueForm
      labels={labels}
      maxAccess={maxAccess}
      recordId={recordId}
      chId={chId}
      seqNo={seqNo}
      getValueGridData={getValueGridData}
      edit={edit}
    />
  )
}

export default ValuesWindow
