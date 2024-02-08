const getNewSalesPerson = () => {
    return {
      recordId: null,
      name: null,
      spRef: null,
      cellPhone: null,
      segmentRef: null,
      commissionPct: null,
      plantId: null,
      plantName: null,
      SPNameRef: null,
      sptId: null,
    }
  }
  
  const populateSalesPerson = obj => {
    return {
      recordId: obj.recordId,
      spRef: obj.spRef,
      name: obj.name,
      cellPhone: obj.cellPhone,
      segmentRef: obj.segmentRef,
      commissionPct: obj.commissionPct,
      plantId: obj.plantId,
      plantName: obj.plantName,
      SPNameRef: obj.SPNameRef,
      sptId: obj.sptId
    }
  }
  
  export { getNewSalesPerson, populateSalesPerson }
  