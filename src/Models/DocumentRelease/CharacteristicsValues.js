import { formatDateFromApi } from "src/lib/date-helper"

const getNewCharValue = (chId, seqNo) => {
    return {
      recordId: null,
      value: null,
      chId: chId,
      seqNo: seqNo
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