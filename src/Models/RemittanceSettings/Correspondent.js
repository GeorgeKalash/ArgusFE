const getNewCorrespondent = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    bpId: null,
    outward: false,
    inward: false,
    isInactive: false
  }
}

const populateCorrespondent = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    bpId: obj.bpId,
    bpRef: obj.bpRef,
    bpName: obj.bpName,
    outward: obj.outward,
    inward: obj.inward,
    isInactive: obj.isInactive
  }
}

export { getNewCorrespondent, populateCorrespondent }
