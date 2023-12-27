const getNewSmsFunctionTemplate = () => {
    return {
        functionId: null,
        templateId: null,
        functionName: null,
        templateName: null
    }
  }
  
  const populateSmsFunctionTemplate = obj => {
    return {
        functionId: obj.functionId,
        templateId: obj.templateId,
        functionName: obj.functionName,
        templateName: obj.templateName,
    }
  }
  
  export { getNewSmsFunctionTemplate , populateSmsFunctionTemplate }
  