import * as yup from 'yup'

function conditionalField(fieldValidators, fieldKey, allowNoLines, mandatoryFields) {
  return function (value) {
    const row = this.parent
    const path = this.path

    const [, arrayKey] = path.match(/^(\w+)\[(\d+)\]/) || []

    const allRows = this.options.context?.[arrayKey] || []
    if (allowNoLines || (!allowNoLines && allRows.length > 1)) {
      const isAnyFieldFilled = Object.entries(fieldValidators).some(([, fn]) => {
        const res = fn(row)
        if (typeof res === 'object' && res?.optional) return false
        return !!res
      })

      if (!isAnyFieldFilled) return true
    }

    const result = fieldValidators[fieldKey](row)
    const isMandatory = mandatoryFields.has(fieldKey)
    const hasValue = value != null && value !== ''

    if (typeof result === 'object' && result !== null && ('optional' in result || 'valid' in result)) {
      if (!hasValue) {
        return isMandatory ? false : result.optional
      }

      return result.valid
    }

    return !!result && hasValue
  }
}

function createConditionalSchema(fieldValidators, allowNoLines, maxAccess, arrayName = 'items') {
  const updatedValidators = { ...fieldValidators }
  const mandatoryFields = new Set()

  maxAccess?.record?.controls.forEach(({ controlId, accessLevel }) => {
    const [parent, id] = controlId?.split('.')
    if (parent === arrayName)
      if (accessLevel === 2) {
        mandatoryFields.add(id)

        if (!(id in updatedValidators)) {
          updatedValidators[id] = row => !!row?.[id]
        }
      }

    if ((accessLevel === 1 || accessLevel === 4) && id in updatedValidators) {
      delete updatedValidators[id]
    }
  })

  const schema = yup.object().shape({
    ...Object.keys(updatedValidators).reduce((shape, field) => {
      shape[field] = yup.mixed().nullable().test(conditionalField(updatedValidators, field, allowNoLines, mandatoryFields))

      return shape
    }, {})
  })

  return { schema, requiredFields: updatedValidators }
}

export { createConditionalSchema }
