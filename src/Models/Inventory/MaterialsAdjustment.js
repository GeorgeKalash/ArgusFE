
const getNewMaterialsAdjustment = () => {
  return {
    recordId: null,
    reference: null,
    date: null,
    siteId: null,
    siteRef: null,
    siteName: null,
    description: null,
    qty: null,
    isVerified: false,
  }
}

const populateMaterialsAdjustment = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    date: obj.date,
    siteId: obj.siteId,
    siteRef: obj.siteRef,
    siteName: obj.siteName,
    description: obj.description,
    qty: obj.qty,
    isVerified: obj.isVerified,
  }
}

export { getNewMaterialsAdjustment, populateMaterialsAdjustment }
