//not used anywhere until now 

const getNewSecurityGroup = () => {
    return {
      sgId: null,
      sgName: null,
      userId: null,
      fullName: null,
      email:  null
    }
  }
  
  const populateSecurityGroup = obj => {
    return {
      sgId: obj.sgId,
      sgName: obj.sgName,
      userId: obj.userId,
      fullName: obj.fullName,
      email: obj.email
    }
  }
  
  export { getNewSecurityGroup, populateSecurityGroup }
  