// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewIdTypes = () => {
  return {
    recordId: null,
    name: null,
    format: null,
    length: null,
    category: null,
    isDiplomat: false,
    clientFileLifeTime: null,
    clientFileExpiryType: null,
    clientFileExpiryTypeName: null,
  }
}

const populateIdTypes = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    format: obj.format,
    length: obj.length,
    category: obj.category,
    isDiplomat: obj.isDiplomat,
    clientFileLifeTime: obj.clientFileLifeTime,
    clientFileExpiryType: obj.clientFileExpiryType,
    clientFileExpiryTypeName: obj.clientFileExpiryTypeName
  }
}

export { getNewIdTypes, populateIdTypes }
