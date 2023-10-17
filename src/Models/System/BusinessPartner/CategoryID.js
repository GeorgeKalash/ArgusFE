// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewCategoryId = () => {
  return {
    recordId: null,
    name: null,
    org: false,
    person: false,
    group: false,
    isUnique: false
  }
}

const populateCategoryId = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    org: obj.org,
    person: obj.person,
    group: obj.group,
    isUnique: obj.isUnique
  }
}

export { getNewCategoryId, populateCategoryId }
