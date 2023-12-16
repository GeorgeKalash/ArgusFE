// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewGroup = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    nraId: null,
    nraRef: null,
    nraDescription: null
  }
}

const populateGroup = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    nraId: obj.nraId,
    nraRef: obj.nraRef,
    nraDescription: obj.nraDescription
  }
}

export { getNewGroup, populateGroup }
