import CharacteristicForm from '../forms/CharacteristicForm'

const CharacteristicsWindow = ({
  recordId,
  labels,
  maxAccess,
  getCharacteristicGridData,
  classId,
}) => {

  return (
    <CharacteristicForm
      labels={labels}
      maxAccess={maxAccess}
      recordId={recordId}
      getCharacteristicGridData={getCharacteristicGridData}
      classId={classId}
    />
  )
}

export default CharacteristicsWindow
