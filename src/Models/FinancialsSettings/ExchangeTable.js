// ** Helpers

const getNewExchangeTable = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    currencyId: null,
    rateAgainstCurrencyId: null,
    rateCalcMethod: null,
    rateAgainst:null
  }
}

const populateExchangeTable = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    currencyId: obj.currencyId,
    rateAgainstCurrencyId: obj.rateAgainstCurrencyId,
    rateCalcMethod: obj.rateCalcMethod,
    rateAgainst:obj.rateAgainst


  }
}

export { getNewExchangeTable, populateExchangeTable }
