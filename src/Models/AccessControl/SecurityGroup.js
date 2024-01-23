const getNewSecurityGroup = () => {
  return {
    recordId: null,
    name: null,
    description: null
  }
}

const populateSecurityGroup = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name,
    description: obj.description
  }
}

export { getNewSecurityGroup, populateSecurityGroup }
