// ** Helpers
const getNewProductMaster = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    patypeth: null,
    function:null,
    correspondantId:null,
    countryId:null,
    language:null,
    commissionBase:null,
    interfaceId:null,
    posMsg:null,
    posMsgIsActive:null,
    isInactive:null
  }
}

const populateProductMaster = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    type: obj.type,
    function: obj.function,
    correspondantId: obj.correspondantId,
    countryId: obj.countryId,
    language: obj.language,
    commissionBase: obj.commissionBase,
    interfaceId: obj.interfaceId,
    interfaceposMsgId: obj.posMsg,
    posMsgIsActive: obj.posMsgIsActive,
    isInactive: obj.isInactive
  }
}

export { getNewProductMaster, populateProductMaster }