// ** Helpers

const getNewProfession = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    flName: null,
    monthlyIncome: null,
    riskFactor: null
  }
}

const populateProfession = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    flName: obj.flName,
    monthlyIncome: obj.monthlyIncome,
    riskFactor: obj.riskFactor


  }
}

export { getNewProfession, populateProfession }
