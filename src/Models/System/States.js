const getNewState = () => {
    return {
      recordId: null,
      name: null,
      countryId: null,
      countryName: null
    }
  }
  
  const populateState = obj => {
    return {
      recordId: obj.recordId,
      name: obj.name,
      countryId: obj.countryId,
      countryName: obj.countryName,
    }
  }
  
  export { getNewState, populateState }
  