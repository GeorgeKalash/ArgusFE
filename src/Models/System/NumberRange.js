import { formatDateFromApi } from 'src/lib/date-helper'

const getNewNumberRange = () => {
  return {
    recordId: null,
    reference: null,
    description: null,
    min: null,
    max: null,
    current: null,
    external: false,
    dateRange: false,
    startDate: null,
    endDate: null
  }
}

const populateNumberRange = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    description: obj.description,
    min: obj.min,
    max: obj.max,
    current: obj.current,
    external: obj.external,
    dateRange: obj.dateRange,
    startDate: obj.startDate && formatDateFromApi(obj.startDate),
    endDate: obj.endDate   && formatDateFromApi(obj.endDate)

  }
}

export { getNewNumberRange, populateNumberRange }
