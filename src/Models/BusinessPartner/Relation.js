// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewRelation = () => {
  return {
    recordId: null,
    fromBPId: null ,
    toBPId: null ,
    relationId: null ,
    relationName: null  ,
    startDate: null ,
    endDate: null ,
    toBPName: null 
  }
}

const populateRelation = obj => {
  return {
    recordId: obj.recordId,
    fromBPId: obj.fromBPId,
    toBPId: obj.toBPId,
    relationId: obj.relationId,
    relationName: obj.relationName,
    startDate: obj.startDate,
    endDate: obj.endDate,
    toBPName: obj.toBPName
  }
}

export { getNewRelation, populateRelation }
