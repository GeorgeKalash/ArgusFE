const getNewStrategyPrerequisite = (strategyId, codeId) => {
    return {
      codeId: codeId,
      strategyId: strategyId,
      prerequisiteId: null,
      prerequisiteCode: null,
      code: null
    }
  }
  
  const populateStrategyPrerequisite = obj => {
    return {
      codeId: obj.codeId,
      strategyId: obj.strategyId,
      prerequisiteId: obj.prerequisiteId,
      prerequisiteCode: obj.prerequisiteCode,
      code: obj.code
    }
  }
  
  export { getNewStrategyPrerequisite, populateStrategyPrerequisite }