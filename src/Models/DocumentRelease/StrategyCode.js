const getNewStrategyCode = (strategyId) => {
    return {
      codeId: null,
      name: null,
      code: null,
      strategyId: strategyId
    }
  }
  
  const populateStrategyCode = obj => {
    return {
      codeId: obj.codeId,
      name: obj.name,
      code: obj.code,
      strategyId: obj.strategyId
    }
  }
  
  export { getNewStrategyCode, populateStrategyCode }