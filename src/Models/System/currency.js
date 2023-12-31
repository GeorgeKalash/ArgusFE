const getNewCurrency = () => {
  return {
    recordId: null,
    reference: null,
    decimals: null,
    name: null,
    flName: null,
    profileId: null,
    sale: false,
    purchase: false,
    currencyType: null,
    currencyTypeName: null,
    isoCode: null,
    symbol: null
  }
}

const populateCurrency = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    decimals: obj.decimals,
    flName: obj.flName,
    name: obj.name,
    profileId: obj.profileId,
    sale: obj.sale,
    purchase: obj.purchase,
    currencyType: obj.currencyType,
    currencyTypeName: obj.currencyTypeName,
    isoCode: obj.isoCode,
    symbol: obj.symbol
  }
}

export { getNewCurrency, populateCurrency }
