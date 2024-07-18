import { SystemRepository } from 'src/repositories/SystemRepository'
import { DISABLED, MANDATORY } from 'src/services/api/maxAccess'
import { getStorageData } from 'src/storage/storage'

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

const mergeWithMaxAccess = (maxAccess, field, fieldName) => {
  maxAccess = JSON.parse(JSON.stringify(maxAccess))
  let controls = maxAccess.record.controls

  let obj = controls.find(obj => obj.controlId === fieldName)

  if (obj) {
    obj.accessLevel = field?.mandatory ? MANDATORY : DISABLED
  } else {
    if (field?.mandatory) {
      controls.push({
        sgId: 18,
        resourceId: '',
        controlId: fieldName,
        accessLevel: field?.mandatory ? MANDATORY : DISABLED
      })
    } else if (field?.readOnly) {
      controls.push({
        sgId: 18,
        resourceId: '',
        controlId: fieldName,
        accessLevel: field?.readOnly ? DISABLED : MANDATORY
      })
    } else {
      controls = maxAccess.record.controls.filter(obj => obj.controlId !== fieldName)
    }
  }

  return {
    ...maxAccess,
    record: {
      ...maxAccess.record,
      controls
    }
  }
}

const fetchData = async (getRequest, id, repository) => {
  let extension, parameters

  switch (repository) {
    case 'dtId': //default user
      const userData = getStorageData('userData')
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

const refBehavior = async (getRequest, maxAccess, selectNraId = undefined, readOnlyOnEditMode) => {
  let sku = { readOnly: false, mandatory: false }
  let reference = { readOnly: false, mandatory: false }
  let isExternal
  console.log(readOnlyOnEditMode, 'issa')

  const nraId = selectNraId

  if (nraId) {
    console.log(readOnlyOnEditMode, 'readOnlyOnEditMode')
    isExternal = await fetchData(getRequest, nraId, 'isExternal')

    sku = {
      readOnly: isExternal?.external ? false : true,
      mandatory: isExternal?.external ? true : false
    }
    reference = {
      readOnly: isExternal?.external ? false : true,
      mandatory: isExternal?.external ? true : false
    }
  } else {
    sku = {
      readOnly: false,
      mandatory: true
    }
    reference = {
      readOnly: false,
      mandatory: true
    }
  }
  if (readOnlyOnEditMode) {
    sku = {
      readOnly: true,
      mandatory: false
    }
    reference = {
      readOnly: true,
      mandatory: false
    }
  }

  if (maxAccess) {
    if (sku) maxAccess = await mergeWithMaxAccess(maxAccess, sku, 'sku')
    if (reference) maxAccess = await mergeWithMaxAccess(maxAccess, reference, 'reference')
  }

  return {
    sku,
    reference,
    maxAccess,
    selectNraId
  }
}

export default refBehavior

// if nraId : get request
