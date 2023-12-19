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
    groupName: null
  }
}

const populatePlant = obj => {
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
    groupName: null
  }
}

export { getNewPlant, populatePlant }
