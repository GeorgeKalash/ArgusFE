const getNewAddress = () => {
  return {
    recordId: null,
    name: null,
    countryId: null,
    stateId: null,
    stateName: null,
    cityId: null,
    city: null,
    street1: null,
    street2: null,
    email1: null,
    email2: null,
    phone: null,
    phone2: null,
    phone3: null,
    postalCode:null,
    cityDistrictId: null,
    cityDistrict:null,
    bldgNo: null,
    unitNo: null,
    subNo: null
  }
}

const populateAddress = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    countryId: obj.countryId,
    stateId: obj.stateId,
    stateName: obj.stateName,
    cityId: obj.cityId,
    city: obj.city,
    street1: obj.street1,
    street2: obj.street2,
    email1: obj.email1,
    email2: obj.email2,
    phone: obj.phone,
    phone2: obj.phone2,
    phone3: obj.phone3,
    postalCode:obj.postalCode,
    cityDistrictId: obj.cityDistrictId,
    cityDistrict:obj.cityDistrict,
    bldgNo: obj.bldgNo,
    unitNo: obj.unitNo,
    subNo: obj.subNo
  }
}

export { getNewAddress, populateAddress }
