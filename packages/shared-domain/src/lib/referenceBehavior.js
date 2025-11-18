import { SystemRepository } from 'src/repositories/SystemRepository'
import { DISABLED, MANDATORY } from 'src/services/api/maxAccess'

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
    case 'isExternal':
      parameters = `_recordId=${id}`
      extension = SystemRepository.NumberRange.get
      break
    default:
      return null
  }

  return await getData(getRequest, extension, parameters)
}

const refBehavior = async (getRequest, maxAccess, selectNraId = undefined, readOnlyOnEditMode, name = 'reference') => {
  let type = { readOnly: false, mandatory: false }
  let isExternal

  const nraId = selectNraId

  if (nraId) {
    isExternal = await fetchData(getRequest, nraId, 'isExternal')

    type = {
      readOnly: isExternal?.external ? false : true,
      mandatory: isExternal?.external ? true : false
    }
  } else {
    type = {
      readOnly: false,
      mandatory: true
    }
  }
  if (readOnlyOnEditMode) {
    type = {
      readOnly: true,
      mandatory: false
    }
  }

  if (maxAccess) {
    if (type) maxAccess = await mergeWithMaxAccess(maxAccess, type, name)
  }

  return {
    type,
    maxAccess,
    selectNraId
  }
}

export default refBehavior
