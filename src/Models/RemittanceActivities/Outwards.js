const getNewOutwards = () => {
  return {
    recordId: null,
    name: null,
    plantId: null,
    countryId: null,
    dispersalType: null,
    currencyId: null,
    agentId: null,
    idNo: null,
    cl_reference: null,
    cl_name: null,
    idType: null,
    nationalityId: null,
    amount: null,
    productId: null,
    fees: null,
    baseAmount: null,
    net: null,
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
    fees: obj.fees,
    baseAmount: obj.baseAmount,
    net: obj.net,
  }
}

export { getNewOutwards, populateOutwards }