// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewInterface = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    path: null,
    description:null
  }
}

const populateInterface = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    path: obj.path,
    description: obj.description
  }
}

export { getNewInterface, populateInterface }