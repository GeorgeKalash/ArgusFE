const getNewSmsTemplate = () => {
    return {
      recordId: null,
      smsBody: null,
      name: null
    }
  }
  
  const populateSmsTemplate = obj => {
    return {
      recordId: obj.recordId,
      smsBody: obj.smsBody,
      name: obj.name
    }
  }
  
  export { getNewSmsTemplate , populateSmsTemplate }
  