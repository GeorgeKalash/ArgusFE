const getNewCityDistrict = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    countryId: null,
    cityId: null,
    cityRef: null,
    cityName: null,
    countryName: null
  }
}

const populateCityDistrict = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    countryId: obj.countryId,
    cityId: obj.cityId,
    cityRef: obj.cityRef,
    cityName: obj.cityName,
    countryName: obj.countryName
  }
}

export { getNewCityDistrict, populateCityDistrict }
