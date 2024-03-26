import ValueForm from '../forms/ValueForm'

const ValuesWindow = ({
  recordId,
  labels,
  maxAccess,
  seqNo,
  chId,
  getValueGridData
}) => {

  return (
    <ValueForm
      labels={labels}
      maxAccess={maxAccess}
      recordId={recordId}
      chId={chId}
      seqNo={seqNo}
      getValueGridData={getValueGridData}
    />
  )
}

export default ValuesWindow
