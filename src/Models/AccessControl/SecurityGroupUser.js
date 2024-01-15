//not used anywhere until now 

const getNewSecurityGroupUser = () => {
    return {
      sgId: null,
      sgName: null,
      userId: null,
      fullName: null,
      email:  null
    }
  }
  
  const populateSecurityGroupUser = obj => {
    return {
      sgId: obj.sgId,
      sgName: obj.sgName,
      userId: obj.userId,
      fullName: obj.fullName,
      email: obj.email
    }
  }
  
  export { getNewSecurityGroupUser, populateSecurityGroupUser }
  