// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewSalaryRange = () => {
  return {
    recordId: null,
    min: null,
    max: null,

  }
}

const populateSalaryRange = obj => {
  return {
    recordId: obj.recordId,
    min: obj.min,
    max: obj.max,

  }
}

export { getNewSalaryRange, populateSalaryRange }
