

const getNewCommissionSchedule = () => {
  return {
    recordId: null,
    name: null,
    typeId: null,
    typeName: null,
  }
}

const populateCommissionSchedule = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    typeId: obj.typeId,
    typeName: obj.typeName,
  }
}

export { getNewCommissionSchedule, populateCommissionSchedule }
