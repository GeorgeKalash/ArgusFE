const getNewCorrespondent = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    bpId: null,
    tt: false,
    inwards: false,
    isInactive: null
  }
}

const populateCorrespondent = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    bpId: obj.bpId,
    tt: obj.tt,
    inwards: obj.inwards,
    isInactive: obj.isInactive
  }
}

export { getNewCorrespondent, populateCorrespondent }
