const getNewStrategyIndicator = (strategyId, codeId) => {
    return {
      codeId: codeId,
      strategyId: strategyId,
      seqNo: null,
      indicatorId: null,
      name: null
    }
  }
  
  const populateStrategyIndicator = obj => {
    return {
      codeId: obj.codeId,
      strategyId: obj.strategyId,
      seqNo: obj.seqNo,
      indicatorId: obj.indicatorId,
      name: obj.name
    }
  }
  
  export { getNewStrategyIndicator, populateStrategyIndicator }