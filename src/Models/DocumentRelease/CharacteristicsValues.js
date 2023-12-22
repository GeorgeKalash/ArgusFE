import { formatDateFromApi } from "src/lib/date-helper"

const getNewCharValue = (chId) => {
    return {
      recordId: null,
      value: null,
      chId: chId,
      seqNo: null
    }
  }
  
  const populateCharValue = obj => {
    return {
      recordId: obj.recordId,
      value: obj.value,
      chId: obj.chId,
      seqNo: obj.seqNo
    }
  }
  
  export { getNewCharValue, populateCharValue }