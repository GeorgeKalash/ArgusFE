const getNewClass = () => {
    return {
      recordId: null,
      name: null,
      functionId: null,
      characteristicOperator: null
    }
  }
  
  const populateClass = obj => {
    return {
      recordId: obj.recordId,
      name: obj.name,
      functionId: obj.functionId,
      characteristicOperator: obj.characteristicOperator
    }
  }
  
  export { getNewClass, populateClass }