import { formatDateFromApi } from "src/lib/date-helper"

const getNewCharGeneral = () => {
    return {
      recordId: null,
      name: null,
      dataType: null,
      propertyName: null,   
      textSize: null,
      isRange: false,
      isMultiple: false,   
      allowNegative: false,
      caseSensitive: false,
      validFrom: null
    }
  }
  
  const populateCharGeneral = obj => {
    return {
      recordId: obj.recordId,
      name: obj.name,
      dataType: obj.dataType,
      propertyName: obj.propertyName,  
      textSize: obj.textSize,
      isRange: obj.isRange,
      isMultiple: obj.isMultiple,   
      allowNegative: obj.allowNegative,
      caseSensitive: obj.caseSensitive,
      validFrom: obj.validFrom && formatDateFromApi(obj.validFrom)
    }
  }
  
  export { getNewCharGeneral, populateCharGeneral }