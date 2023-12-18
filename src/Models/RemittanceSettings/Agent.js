// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewAgents = () => {
  return {
    recordId: null,
    name: null,
    countryId: null,
    countryRef: null,
    countryName: null
  }
}

const populateAgents = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    countryId: obj.countryId,
    countryRef: obj.countryRef,
    countryName: obj.countryName
  }
}

export { getNewAgents, populateAgents }
