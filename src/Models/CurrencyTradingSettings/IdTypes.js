// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewIdTypes = () => {
  return {
    recordId: null,
    name: null,
    format: null,
    length: null,
    category: null
  }
}

const populateIdTypes = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    format: obj.format,
    length: obj.length,
    category: obj.category
  }
}

export { getNewIdTypes, populateIdTypes }
