
  const getNewMaterialsAdjustmentDetail = () => {
    return {
      recordId: null,
      itemId: null,
      itemName: null,
      qty: null,
      muQty: null,
      unitCost: null,
      totalCost: null,
    }
  }
  
  const populateMaterialsAdjustmentDetail = obj => {
    const totalCost = obj.unitCost * obj.qty;

    return {
      recordId: obj.recordId,
      itemId: obj.itemId,
      itemName: obj.itemName,
      qty: obj.qty,
      muQty: obj.muQty,
      unitCost: obj.unitCost,
      totalCost: totalCost,
    }
  }
  
  export { getNewMaterialsAdjustmentDetail, populateMaterialsAdjustmentDetail }
  