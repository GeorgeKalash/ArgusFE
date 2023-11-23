// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewAgents = () => {
  return {
    recordId: null,
    name: null
  }
}

const populateAgents = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name
  }
}

export { getNewAgents, populateAgents }