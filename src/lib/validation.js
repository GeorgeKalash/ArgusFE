import * as yup from 'yup'

function conditionalField(fieldValidators, fieldKey, allowNoLines) {
  return function (value) {
    const row = this.parent
    const path = this.path

    console.log(this.options.context)

    const [, arrayKey] = path.match(/^(\w+)\[(\d+)\]/) || []

    console.log(allowNoLines)
    const allRows = this.options.context?.[arrayKey] || []
    if (allowNoLines || (!allowNoLines && allRows.length > 1)) {
      if (
        row[fieldKey] !== null &&
        row[fieldKey] !== undefined &&
        row[fieldKey] !== 0 &&
        fieldValidators[fieldKey] !== '' &&
        !fieldValidators[fieldKey](row)
      ) {
        return false
      }

      const isAnyFieldFilled = Object.entries(fieldValidators).some(([, fn]) => {
        console.log(fn(row))

        return !!fn(row)
      })

      console.log(isAnyFieldFilled)

      if (!isAnyFieldFilled) return true
    }

    return !!fieldValidators[fieldKey](row) && value !== undefined
  }
}

function createConditionalSchema(fieldValidators, allowNoLines, maxAccess, arrayName = 'items') {
  const updatedValidators = { ...fieldValidators }

  maxAccess?.record?.controls.forEach(({ controlId, accessLevel }) => {
    const [parent, id] = controlId?.split('.')
    if (parent === arrayName)
      if (accessLevel === 2 && !(id in updatedValidators)) {
        updatedValidators[id] = row => row?.[id]
      }

    if ((accessLevel === 1 || accessLevel === 4) && id in updatedValidators) {
      delete updatedValidators[id]
    }
  })

  const schema = yup.object().shape({
    ...Object.keys(updatedValidators).reduce((shape, field) => {
      shape[field] = yup.mixed().nullable().test(conditionalField(updatedValidators, field, allowNoLines))

      return shape
    }, {})
  })

  return { schema, requiredFields: updatedValidators }
}

export { createConditionalSchema }
