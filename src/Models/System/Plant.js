const getNewPlant = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    addressId: null,
    segmentRef: null,
    licenseNo: null,
    crNo: null,
    costCenterId: null,
    costCenterName: null,
    groupId: null,
    groupName: null,
    segmentName: null
  }
}

const populatePlant = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    addressId: obj.addressId,
    segmentRef: obj.segmentRef,
    licenseNo: obj.licenseNo,
    crNo: obj.crNo,
    costCenterId: obj.costCenterId,
    costCenterName: obj.costCenterName,
    groupId: obj.groupId,
    groupName: obj.groupName,
    segmentName: obj.segmentName
  }
}

export { getNewPlant, populatePlant }
