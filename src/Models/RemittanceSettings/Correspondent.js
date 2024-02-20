const getNewCorrespondent = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    bpId: null,
    currencyId: null,
    currencyRef: null,
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
    currencyId: obj.currencyId,
    currencyRef: obj.currencyRef,
    isInactive: obj.isInactive
  }
}

export { getNewCorrespondent, populateCorrespondent }
