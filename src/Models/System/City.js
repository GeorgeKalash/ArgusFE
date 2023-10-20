const getNewCity = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    countryId: null,
    stateId: null,
    countryName: null,
    stateName: null
  }
}

const populateCity = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    countryId: obj.countryId,
    stateId: obj.stateId,
    purchase: obj.purchase,
    countryName: obj.countryName,
    stateName: obj.stateName
  }
}

export { getNewCity, populateCity }
