import { SystemRepository } from 'src/repositories/SystemRepository'

const getData = async (getRequest, extension, parameters) => {
  try {
    const res = await getRequest({
      extension,
      parameters
    })

    return res?.record
  } catch (error) {
    return null
  }
}

const fetchData = async (getRequest, id, repository) => {
  let extension, parameters

  switch (repository) {
    case 'dtId': //default user
      const userData =
        window && window.sessionStorage.getItem('userData')
          ? JSON.parse(window.sessionStorage.getItem('userData'))
          : null
      const userId = userData?.userId
      parameters = `_userId=${userId}&_functionId=${id}`
      extension = SystemRepository.UserFunction.get
      break
    case 'glbSysNumberRange': //get numberRange  if no dtId
      parameters = `_recordId=${id}`
      extension = SystemRepository.SystemFunction.get
      break
    case 'DocumentType': //get numberRange  if no dtId
      parameters = `_recordId=${id}`
      extension = SystemRepository.DocumentType.qry

      break
    case 'DcTypNumberRange': //get numberRange if user has dtId
      parameters = `_recordId=${id}`
      extension = SystemRepository.DocumentType.get
      break
    case 'isExternal':
      parameters = `_recordId=${id}`
      extension = SystemRepository.NumberRange.get
      break
    default:
      return null // Invalid repository
  }

  return await getData(getRequest, extension, parameters)
}

const reference = async (getRequest, functionId) => {
  const documentType = await fetchData(getRequest, functionId, 'dtId') // ufu
  const dtId = documentType?.dtId
  let nraId
  let errorMessage
  let reference
  let isExternal
  if (documentType) {
    if (dtId) {
      const dcTypNumberRange = await fetchData(getRequest, dtId, 'DcTypNumberRange') //DT
      nraId = dcTypNumberRange?.nraId
    } else {
      const dcTypNumberRange = await fetchData(getRequest, dtId, 'DocumentType') //DT
    }
  } else {
    if (!dtId) {
      const glbSysNumberRange = await fetchData(getRequest, functionId, 'glbSysNumberRange') //fun
      nraId = glbSysNumberRange?.nraId
    }
    if (!nraId) {
      errorMessage = 'Assign the document type to a number range'
    }
    if (nraId) {
      isExternal = await fetchData(getRequest, nraId, 'isExternal')
      reference = {
        readOnly: isExternal?.external ? false : true,
        mandatory: isExternal?.external ? true : false
      }
    }
  }

  return {
    dtId,
    reference,
    errorMessage
  }
}

export default reference
