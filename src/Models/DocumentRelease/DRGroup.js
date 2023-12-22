
const getNewDRGroup = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    classId: null,   
    className: null
  }
}

const populateDRGroup = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    classId: obj.classId,
    className: obj.className
  }
}

export { getNewDRGroup, populateDRGroup }
