// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewRelationType = () => {
  return {
    recordId: null,
    name: null,
    reference: null,
    flName: null,

  }
}

const populateRelationType = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    reference: obj.reference,
    flName: obj.flName,

  }
}

export { getNewRelationType, populateRelationType }
