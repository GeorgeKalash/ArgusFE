
const getNewActivity = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    flName: null,
    industry: null
  }
}

const populateActivity = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    flName: obj.flName,
    industry: obj.industry
  }
}

export { getNewActivity, populateActivity }
