const getNewOutwards = () => {
  return {
    recordId: null,
    name: null,
    plantId: null,
    countryId: null,
    dispersalType: null,
    currencyId: null,
    agentId: null,
    amount: null,
    productId: null,
    fees: null,
  }
}

const populateOutwards = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    plantId: obj.plantId,
    countryId: obj.countryId,
    dispersalType: obj.dispersalType,
    currencyId: obj.currencyId,
    agentId: obj.agentId,
    amount: obj.amount,
    productId: obj.productId,
    fees: obj.fees
  }
}

export { getNewOutwards, populateOutwards }