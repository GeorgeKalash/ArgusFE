const getNewPlant = () => {
  return {
    recordId: null,
    addressId: null,
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

    //not going to use them in post (only address Id)
    //but i don't know how should i use them as being in "address" and maybe for display in edit mode

    /*addName: null,
    addRecordId
    countryId: null,
    stateId: null,
    cityId: null,
    city: null,
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
    cityDistrict:null,
    bldgNo: null,
    unitNo: null,
    subNo: null*/
  }
}

const populatePlant = obj => {
  return {
    recordId: obj.recordId,
    addressId: obj.addressId,
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

    /*addName: obj.addName,
    countryId: obj.countryId,
    stateId: obj.stateId,
    cityId: obj.cityId,
    city: obj.city,
    street1: obj.street1,
    street2: obj.street2,
    email1: obj.email1,
    email2: obj.email2,
    phone: obj.phone,
    phone2: obj.phone2,
    phone3: obj.phone3,
    addressId: obj.addressId,
    postalCode:obj.postalCode,
    cityDistrictId: obj.,
    cityDistrict:null,
    bldgNo: null,
    unitNo: null,
    subNo: null*/
  }
}

export { getNewPlant, populatePlant }
