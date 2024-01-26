const getNewClassFunction = (classId) => {
    return {
      classId: classId,
      functionId: null,
      strategyId: null,
      functionName: null,
      strategyName: null
    }
  }
  
  const populateClassFunction = obj => {
    return {
      classId: obj.classId,
      functionId: obj.functionId,
      strategyId: obj.strategyId,
      functionName: obj.functionName,
      strategyName: obj.strategyName
    }
  }
  
  export { getNewClassFunction, populateClassFunction }