// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewIdFields = () => {
  return {
    accessLevel: null,
    controlId: null,
    accessLevel: null,
    accessLevelName: null
  }
}

const populateIdFields = obj => {
  return {
    accessLevel: obj.accessLevel,
    controlId: obj.controlId,
    accessLevel: obj.accessLevel,
    accessLevelName: obj.accessLevelName
  }
}

export { getNewIdFields, populateIdFields }
