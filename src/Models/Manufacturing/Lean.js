const getNewLean = () => {
    return {
      recordId: null,
      functionId: null,
      seqNo: null,
      reference: null,
      date: null,
      itemId: null,
      sku: null,
      itemName: null,
      qty: null,
      status: null,
      checkedLean: null,
      leanStatusName: null
    }
  }
  
  const populateLean = obj => {
    return {
      recordId: obj.recordId,
      functionId: obj.functionId,
      seqNo: obj.seqNo,
      reference: obj.reference,
      date: obj.date,
      itemId: obj.itemId,
      sku: obj.sku,
      itemName: obj.itemName,
      qty: obj.qty,
      status: obj.status,
      checkedLean: obj.checkedLean,
      leanStatusName: obj.leanStatusName
    }
  }
  
  export { getNewLean, populateLean }
  