import { SystemRepository } from 'src/repositories/SystemRepository'
import { DISABLED, MANDATORY } from 'src/services/api/maxAccess'

const getData = async (getRequest, id) => {
  try {
    const res = await getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: `_recordId=${id}`
    })

    return res.record
  } catch (error) {
    return null
  }
}

const mergeWithMaxAccess = (maxAccess, field, fieldName) => {
  maxAccess = JSON.parse(JSON.stringify(maxAccess))
  let controls = maxAccess.record.controls

  let control = controls.find(obj => obj.controlId === fieldName)

  if (control) {
    control.accessLevel = field.mandatory ? MANDATORY : DISABLED
  } else {
    if (field.mandatory || field.readOnly) {
      controls.push({
        sgId: '',
        resourceId: '',
        controlId: fieldName,
        accessLevel: field.mandatory ? MANDATORY : DISABLED
      })
    } else {
      controls = controls.filter(obj => obj.controlId !== fieldName)
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

const fieldBehavior = async (getRequest, fieldName = 'reference', maxAccess, selectNraId = undefined, editMode) => {
  let field = { readOnly: false, mandatory: true }
  let isExternal
  const nraId = selectNraId
  if (editMode) {
    field = {
      readOnly: true,
      mandatory: false
    }
  } else {
    if (nraId) {
      isExternal = await getData(getRequest, nraId)
      field = {
        readOnly: !isExternal?.external,
        mandatory: isExternal?.external
      }
    }
  }

  if (maxAccess) {
    console.log('maxAccess', maxAccess)
    maxAccess = mergeWithMaxAccess(maxAccess, field, fieldName)
  }

  return {
    field,
    maxAccess,
    selectNraId
  }
}

export default fieldBehavior
