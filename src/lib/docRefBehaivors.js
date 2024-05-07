import { SystemRepository } from 'src/repositories/SystemRepository'

const getData = async (getRequest, extension, parameters) => {
  try {
    const res = await getRequest({
      extension,
      parameters
    })

    return extension.includes('qry') ? res : res.record
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
      parameters = `_dgId=${id}&_startAt=${0}&_pageSize=${50}`
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

const documentType = async (getRequest, functionId, selectNraId = undefined) => {
  console.log(functionId, selectNraId)
  const docType = selectNraId != undefined && (await fetchData(getRequest, functionId, 'dtId')) // ufu
  const dtId = docType?.dtId
  let nraId
  let errorMessage
  let reference
  let isExternal
  let dcTypeRequired
  if (docType && selectNraId === undefined) {
    // mot select combobox
    if (dtId) {
      const dcTypNumberRange = await fetchData(getRequest, dtId, 'DcTypNumberRange') //DT
      nraId = dcTypNumberRange?.nraId
      if (!nraId) {
        errorMessage = 'Assign the document type to a number range'
      }
    } else {
      const documentType = await fetchData(getRequest, functionId, 'DocumentType') //qryDT
      dcTypeRequired = documentType?.list?.filter(item => item?.activeStatus === 1).length > 0
    }
  }
  if (selectNraId === null || (selectNraId === undefined && !dcTypeRequired)) {
    if (!dtId) {
      const glbSysNumberRange = await fetchData(getRequest, functionId, 'glbSysNumberRange') //fun
      nraId = glbSysNumberRange?.nraId
    }
    if (!nraId && !dcTypeRequired) {
      errorMessage = 'Assign the document type to a number range'
    }
  }

  if (selectNraId > 0 && !nraId) {
    nraId = selectNraId
  }
  if (nraId) {
    isExternal = await fetchData(getRequest, nraId, 'isExternal')
    reference = {
      readOnly: isExternal?.external ? false : true,
      mandatory: isExternal?.external ? true : false
    }
  }

  return {
    dtId,
    dcTypeRequired,
    reference,
    errorMessage
  }
}

export default documentType
