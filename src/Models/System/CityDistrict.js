const getNewCityDistrict = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    countryId: null,
    cityId: null
  }
}

const populateCityDistrict = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    countryId: obj.countryId,
    cityId: obj.cityId
  }
}

export { getNewCityDistrict, populateCityDistrict }
