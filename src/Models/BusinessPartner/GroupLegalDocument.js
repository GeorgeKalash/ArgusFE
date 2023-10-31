// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

// formatDateFromApi("/Date(1695513600000)/")

const getNewGroupLegalDocument = () => {
  return {
    groupId: null,
    incId: null,
    required: false,
    mandatory: false,
    groupName: null,
    incName: null
  }
}

const populateGroupLegalDocument = obj => {
  return {
    groupId: obj.groupId,
    incId: obj.incId,
    required: obj.required,
    mandatory: obj.mandatory,
    groupName: obj.groupName,
    incName: obj.incName
  }
}

export { getNewGroupLegalDocument, populateGroupLegalDocument }
