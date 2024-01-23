const getNewClassCharacteristics = (classId) => {
    return {
      classId: classId,
      chId: null,
      chName: null,
      seqNo: null,
      value: null
    }
  }
  
  const populateClassCharacteristics = obj => {
    return {
      classId: obj.classId,
      chId: obj.chId,
      chName: obj.chName,
      seqNo: obj.seqNo,
      value: obj.value
    }
  }
  
  export { getNewClassCharacteristics, populateClassCharacteristics }