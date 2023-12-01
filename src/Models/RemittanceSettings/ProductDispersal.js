// ** Helpers
const getNewProductDispersal = (productId) => {
  return {
    recordId: null,
    productId: productId,
    reference: null,
    name: null,
    dispersalType: null,
    isDefault: false,
    isInactive: false
  }
}

const populateProductDispersal = obj => {
  return {
    recordId: obj.recordId,
    productId: obj.productId,
    reference: obj.reference,
    name: obj.name,
    dispersalType: obj.dispersalType,
    isDefault: obj.isDefault,
    isInactive: obj.isInactive
  }
}

export { getNewProductDispersal, populateProductDispersal }
