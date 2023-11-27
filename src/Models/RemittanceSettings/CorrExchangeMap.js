const getNewCorrExchangeMap = () => {
  return {
    corId: null,
    countryId: null,
    currencyId: null
  }
}

const populateCorrExchangeMap = obj => {
  return {
    corId: obj.corId,
    countryId: obj.countryId,
    currencyId: obj.currencyId
  }
}

export { getNewCorrExchangeMap, populateCorrExchangeMap }
