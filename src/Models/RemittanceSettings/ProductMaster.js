// ** Helpers
const getNewProductMaster = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    type: null,
    functionId: null,
    correspondentId: null,
    languages: null,
    commissionBase: null,
    interfaceId: null,
    posMsg: null,
    posMsgIsActive: false,
    isInactive: false
  }
}

const populateProductMaster = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    type: obj.type,
    functionId: obj.functionId,
    corId: obj.corId,
    corName: obj.corName,

    languages: obj.languages,
    commissionBase: obj.commissionBase,
    interfaceId: obj.interfaceId,
    posMsg: obj.posMsg,
    posMsgIsActive: obj.posMsgIsActive == null ? false : obj.posMsgIsActive,
    isInactive: obj.isInactive
  }
}

export { getNewProductMaster, populateProductMaster }
