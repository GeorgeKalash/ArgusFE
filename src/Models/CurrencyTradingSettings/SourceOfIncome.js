// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewSourceOfIncome = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    flName: null,
    incomeType: null,
    incomeTypeName: null
  }
}

const populateSourceOfIncome = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    flName: obj.flName,
    incomeType: obj.incomeType,
    incomeTypeName: obj.incomeTypeName
  }
}

export { getNewSourceOfIncome, populateSourceOfIncome }
