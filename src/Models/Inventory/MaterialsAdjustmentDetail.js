const getNewMaterialsAdjustmentDetail = () => {
  return {
    recordId: null,
    itemId: null,
    itemName: null,
    qty: null,
    muQty: null,
    unitCost: null,
    totalCost: null,
    qtyInBase: null,
    seqNo: null
  }
}

const populateMaterialsAdjustmentDetail = obj => {
  const totalCost = obj.unitCost * obj.qty

  return {
    recordId: obj.recordId,
    itemId: obj.itemId,
    itemName: obj.itemName,
    qty: obj.qty,
    muQty: obj.muQty,
    unitCost: obj.unitCost,
    totalCost: totalCost,
    notes: obj.notes,
    qtyInBase: obj.qtyInBase,
    seqNo: obj.seqNo
  }
}

export { getNewMaterialsAdjustmentDetail, populateMaterialsAdjustmentDetail }
