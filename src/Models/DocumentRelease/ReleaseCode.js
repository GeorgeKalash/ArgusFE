
const getNewReleaseCode = () => {
  return {
    recordId: null,
    name: null,
    reference: null
  }
}

const populateReleaseCode = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference
  }
}

export { getNewReleaseCode, populateReleaseCode }
