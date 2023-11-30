// ** Helpers
const getNewProductScheduleRange = () => {
  return {
    productId: null,
    plantId: null,
    countryId: null,
    currencyId: null,
    dispersalId: null
  }
}

const populateProductScheduleRange = obj => {
  return {
    seqNo: obj.seqNo,
    productId: obj.productId,
    plantId: obj.plantId,
    countryId: obj.countryId,
    currencyId: obj.currencyId,
    dispersalId: obj.dispersalId
  }
}

export { getNewProductScheduleRange, populateProductScheduleRange }
