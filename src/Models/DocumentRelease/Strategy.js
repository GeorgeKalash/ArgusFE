const getNewStrategy = () => {
    return {
      recordId: null,
      name: null,
      groupName: null,
      groupId: null,
      type: null
    }
  }
  
  const populateStrategy = obj => {
    return {
      recordId: obj.recordId,
      name: obj.name,
      groupName: obj.groupName,
      groupId: obj.groupId,
      type: obj.type
    }
  }
  
  export { getNewStrategy, populateStrategy }