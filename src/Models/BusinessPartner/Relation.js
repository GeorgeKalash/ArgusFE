// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewRelation = () => {
  return {
    recordId: null,
    toBPId: null ,
    relationId: null ,
    relationName: null  ,
    startDate: null ,
    endDate: null ,
    toBPName: null,
    toBPRef: null,
    fromBPId: null
  }
}

const populateRelation = obj => {
  return {
    recordId: obj.recordId,
    toBPId: obj.toBPId,
    relationId: obj.relationId,
    relationName: obj.relationName,
    startDate: obj.startDate,
    endDate: obj.endDate,
    toBPName: obj.toBPName,
    toBPRef: obj.toBPRef,
    fromBPId: obj.fromBPId
  }
}

export { getNewRelation, populateRelation }
