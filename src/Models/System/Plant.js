const getNewPlant = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    segmentRef: null,
    licenseNo: null,
    crNo: null,
    costCenterId: null,
    costCenterName: null,
    groupId: null,
    groupName: null,
    segmentName: null,

    addName: null,
    countryId: null,
    stateId: null,
    cityId: null,
    cityName: null,
    street1: null,
    street2: null,
    email1: null,
    email2: null,
    phone: null,
    phone2: null,
    phone3: null,
    addressId: null,
    postalCode:null,
    cityDistrictId: null,
    cityDistrictName:null,
    bldgNo: null,
    unitNo: null,
    subNo: null
  }
}

const populatePlant = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    segmentRef: obj.segmentRef,
    licenseNo: obj.licenseNo,
    crNo: obj.crNo,
    costCenterId: obj.costCenterId,
    costCenterName: obj.costCenterName,
    groupId: obj.groupId,
    groupName: obj.groupName,
    segmentName: obj.segmentName,

    addName: obj.name,
    countryId: obj.countryId,
    stateId: obj.stateId,
    cityId: obj.cityId,
    cityName: obj.city,
    street1: obj.street1,
    street2: obj.street2,
    email1: obj.email1,
    email2: obj.email2,
    phone: obj.phone,
    phone2: obj.phone2,
    phone3: obj.phone3,
    addressId: obj.addressId,
    postalCode:obj.postalCode,
    cityDistrictId: obj.cityDistrictId,
    cityDistrictName:obj.cityDistrict,
    bldgNo: obj.bldgNo,
    unitNo: obj.unitNo,
    subNo: obj.subNo
  }
}

export { getNewPlant, populatePlant }
