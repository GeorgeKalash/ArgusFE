// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewCommissionType = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    type: null,
    typeName:null
  }
}

const populateCommissionType = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    type: obj.type,
    typeName: obj.typeName
  }
}

export { getNewCommissionType, populateCommissionType }