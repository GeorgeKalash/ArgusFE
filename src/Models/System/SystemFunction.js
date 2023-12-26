const getNewSystemFunction = () => {
    return {
        sfName: null,
        nraId: null,
        nraRef: null,
        functionId: null,
        batchNRAId: null,
        batchNRARef: null
    }
  }
  
  const populateSystemFunction = obj => {
    return {
        sfName: obj.sfName,
        nraId: obj.nraId,
        nraRef: obj.nraRef,
        functionId: obj.functionId,
        batchNRAId: obj.batchNRAId,
        batchNRARef: obj.batchNRARef
    }
  }
  
  export { getNewSystemFunction , populateSystemFunction }
  