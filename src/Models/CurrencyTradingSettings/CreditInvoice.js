const getNewCreditOrder = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    date: null,
    functionId: null,
    currencyId: null,
    plantId: null,
    corId: null,
    amount: null,
    notes: null,
    wip: null,
    status: null,
    releaseStatus: null,
    wipName: null,
    statusName: null,
    rsName: null,
    exRate: null,
    rateCalcMethod: null,
    plantRef: null,
    correspondantName: null,
    currencyRef: null
  }
}

const populateCreditOrder = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    date: obj.date,
    functionId: obj.functionId,
    currencyId: obj.currencyId,
    plantId: obj.plantId,
    corId: obj.corId,
    amount: obj.amount,
    notes: obj.notes,
    wip: obj.wip,
    releaseStatus: obj.releaseStatus,
    status: obj.status,
    wipName: obj.wipName,
    rsName: obj.rsName,
    statusName: obj.statusName,
    exRate: obj.exRate,
    rateCalcMethod: obj.rateCalcMethod,
    plantRef: obj.plantRef,
    correspondantName: obj.correspondantName,
    currencyRef: obj.currencyRef
  }
}

export { getNewCreditOrder, populateCreditOrder }
