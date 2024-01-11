const getNewUserDocument = () => {
    return {
        userId: null,
        key: null,
        value: null,
        dtId_510: null,
        dtId_511: null,
        dtId_512: null,
        dtId_513: null,
        dtId_515: null,
        plantId: null,
        siteId: null,
        cashAccountId: null,
        cashAccountRef: null,
        cashAccountName: null,
        spId: null
    }
  }
  
  const populateUserDocument = obj => {
    return {
        userId: obj.userId,
        key: obj.key,
        value: obj.value,
        dtId_510: obj.dtId_510,
        dtId_511: obj.dtId_511,
        dtId_512: obj.dtId_512,
        dtId_513: obj.dtId_513,
        dtId_515: obj.dtId_515,
        plantId: obj.plantId,
        siteId: obj.siteId,
        cashAccountId: obj.cashAccountId,
        cashAccountRef: obj.cashAccountRef,
        cashAccountName: obj.cashAccountName,
        spId: obj.spId
    }
  }
  
  export { getNewUserDocument , populateUserDocument }
  