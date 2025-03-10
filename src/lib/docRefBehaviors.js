import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
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

const mergeWithMaxAccess = (maxAccess, reference, dcTypeRequired, objectName) => {
  maxAccess = JSON.parse(JSON.stringify(maxAccess))
  let controls = maxAccess.record.controls

  let obj = controls.find(obj => obj.controlId === 'reference')
  if (obj) {
    obj.accessLevel = reference?.mandatory ? MANDATORY : DISABLED
  } else {
    if (reference?.mandatory) {
      controls.push({
        sgId: 0,
        resourceId: '',
        controlId: `${objectName ? objectName + '.' : ''}reference`,
        accessLevel: reference?.mandatory ? MANDATORY : DISABLED
      })
    } else if (reference?.readOnly) {
      controls.push({
        sgId: 0,
        resourceId: '',
        controlId: `${objectName ? objectName + '.' : ''}reference`,
        accessLevel: reference?.readOnly ? DISABLED : MANDATORY
      })
    } else {
      controls = maxAccess.record.controls.filter(obj => obj.controlId != 'reference')
    }
  }
  console.log('check access doc ', dcTypeRequired)
  if (dcTypeRequired) {
    controls.push({
      sgId: 0,
      resourceId: '',
      controlId: `${objectName ? objectName + '.' : ''}dtId`,
      accessLevel: MANDATORY
    })
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

const documentType = async (
  getRequest,
  functionId = undefined,
  maxAccess,
  selectNraId = undefined,
  hasDT = true,
  objectName
) => {
  const docType = selectNraId === undefined && functionId && (await fetchData(getRequest, functionId, 'dtId')) // ufu
  const dtId = docType?.dtId
  let nraId
  let errorMessage = ''
  let reference
  let isExternal
  let dcTypeRequired
  let activeStatus = true

  if ((docType && selectNraId === undefined) || selectNraId === 'nraId') {
    if (dtId) {
      const dcTypNumberRange = await fetchData(getRequest, dtId, 'DcTypNumberRange') //DT
      nraId = dcTypNumberRange?.nraId
      activeStatus = dcTypNumberRange?.activeStatus < 0 ? false : true
      if (!nraId) {
        errorMessage = 'Assign the document type to a number range'
      }
    }
    if ((!dtId || !activeStatus) && hasDT && functionId) {
      const documentType = await fetchData(getRequest, functionId, 'DocumentType') //qryDT
      dcTypeRequired = documentType?.list?.filter(item => item?.activeStatus === 1).length > 0
    }
  }

  if ((selectNraId === 'nraId' || selectNraId === undefined) && functionId) {
    if (((!dtId || dtId) && !nraId) || (nraId && !activeStatus)) {
      const glbSysNumberRange = await fetchData(getRequest, functionId, 'glbSysNumberRange') //fun
      nraId = glbSysNumberRange?.nraId

      if (nraId && dcTypeRequired) {
        dcTypeRequired = false
      }
      activeStatus = true
    }
    if (!nraId && !dcTypeRequired) {
      errorMessage = 'Assign the system Function to a number range'
    } else {
      errorMessage = ''
    }
  }

  if (selectNraId > 0 && !nraId) {
    nraId = selectNraId
  }
  if (nraId && activeStatus) {
    isExternal = await fetchData(getRequest, nraId, 'isExternal')
    reference = {
      readOnly: isExternal?.external ? false : true,
      mandatory: isExternal?.external ? true : false
    }
    if (maxAccess) maxAccess = await mergeWithMaxAccess(maxAccess, reference, dcTypeRequired, objectName)
  } else if (!nraId) {
    if (maxAccess) maxAccess = await mergeWithMaxAccess(maxAccess, reference, dcTypeRequired, objectName)
  }

  return {
    dtId,
    dcTypeRequired,
    reference,
    errorMessage,
    maxAccess,
    selectNraId
  }
}

export default documentType
