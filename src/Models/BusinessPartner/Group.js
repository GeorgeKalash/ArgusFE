// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewGroup = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    nraId: null,
    nraRef: null,
    NRADescription: null
  }
}

const populateGroup = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    nraId: obj.nraId,
    nraRef: obj.person,
    NRADescription: obj.NRADescription
  }
}

export { getNewGroup, populateGroup }
