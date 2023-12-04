const getNewOutwards = () => {
  return {
    recordId: null,
    name: null
  }
}

const populateOutwards = obj => {
  return {
    recordId: obj.recordId,
    name: obj.name
  }
}

export { getNewOutwards, populateOutwards }