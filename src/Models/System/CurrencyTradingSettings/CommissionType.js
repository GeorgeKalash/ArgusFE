// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewCommissionType = () => {
  return {
    recordId: null,
    name: null,
    reference: false,
    type: false
  }
}

const populateCommissionType = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.org,
    type: obj.person
  }
}

export { getNewCommissionType, populateCommissionType }
