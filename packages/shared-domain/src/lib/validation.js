import * as yup from 'yup'
 
function conditionalField(detectFns, requiredFns, fieldKey, allowNoLines, isForcedMandatory) {
  return function (value) {
    const row = this.parent
    const path = this.path

    const [, arrayKey] = path.match(/^(\w+)\[(\d+)\]/) || []

    const allRows = this.options.context?.[arrayKey] || []
    if (!isForcedMandatory) { 
      if (allowNoLines || allRows.length > 1) {
        const isAnyFieldFilled = Object.entries(detectFns).some(([, fn]) => {
        return !!fn(row)
      })

      if (!isAnyFieldFilled) return true
    }
      const isRequired = requiredFns[fieldKey](row)
      if (!isRequired) return true
      return value != null && value !== ''
 
    }

    return value != null && value !== ''
  }
}

function createConditionalSchema(fieldValidators, allowNoLines, maxAccess, arrayName = 'items') {
  const updatedValidators = { ...fieldValidators }
  const forcedMandatory = new Set()
  maxAccess?.record?.controls?.forEach(({ controlId, accessLevel }) => {
    const [parent, id] = controlId?.split('.')
    if (parent !== arrayName || !id) return
    if (accessLevel === 2) {
      updatedValidators[id] = () => true
      forcedMandatory.add(id)

    } else if (accessLevel === 1 || accessLevel === 4) {
      delete updatedValidators[id]
      forcedMandatory.delete(id)
    }
  })

  const schema = yup.object().shape({
    ...Object.keys(updatedValidators).reduce((shape, field) => {
      shape[field] = yup.mixed().nullable().test(conditionalField(fieldValidators, updatedValidators, field, allowNoLines, forcedMandatory.has(field)))

      return shape
    }, {})
  })

  return { schema, requiredFields: updatedValidators }
}

function withExtraFieldTest(schema, field, name, message, testFn) {
  return schema.shape({
    [field]: schema.fields[field].test(name, message, testFn)
  })
}

export { createConditionalSchema, withExtraFieldTest }
