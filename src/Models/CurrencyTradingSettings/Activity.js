
const getNewActivity = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    flName: null,
    industry: null //actual combo fills from SY.qryKVS?_database=148
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
