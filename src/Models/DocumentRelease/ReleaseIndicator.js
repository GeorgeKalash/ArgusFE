
const getNewReleaseInd = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    changeabilityName: null,   
    changeability: null, // SY.qryKVS?_database=45
    isReleased: false
  }
}

const populateReleaseInd = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    changeabilityName: obj.changeabilityName,
    changeability: obj.changeability,
    isReleased: obj.isReleased
  }
}

export { getNewReleaseInd, populateReleaseInd }
