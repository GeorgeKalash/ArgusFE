const getNewCountry = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    flName: null,
    currencyId: null,
    regionId: null,
    ibanLength: null,
    isInactive: false,
    currencyRef: null,
    currencyName: null,
    regionRef: null,
    regionName: null
  }
}

const populateCountry = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    flName: obj.flName,
    currencyId: obj.currencyId,
    regionId: obj.regionId,
    ibanLength: obj.ibanLength,
    isInactive: obj.isInactive,
    currencyRef: obj.currencyRef,
    currencyName: obj.currencyName,
    regionRef: obj.regionRef,
    regionName: obj.regionName
  }
}

export { getNewCountry, populateCountry }
