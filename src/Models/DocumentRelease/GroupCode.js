
const getNewGroupCode = (groupId) => {
  return {
    codeId: null,
    groupId: groupId,
    codeRef: null,
    codeName: null
  }
}

const populateGroupCode = obj => {
  return {
    codeId: obj.codeId,
    groupId: obj.groupId,
    codeRef: obj.codeRef,
    codeName: obj.codeName
  }
}

export { getNewGroupCode, populateGroupCode }

// used in DR groups approver tab
