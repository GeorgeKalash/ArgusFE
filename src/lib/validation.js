import * as yup from 'yup'

function conditionalField(fieldValidators, fieldKey, allowNoLines) {
  return function (value) {
    const row = this.parent
    const path = this.path

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
        return !!(fn(row) && row[fieldKey] !== null)
      })

      if (!isAnyFieldFilled) return true
    }

    return !!fieldValidators[fieldKey](row) && value !== undefined
  }
}

function createConditionalSchema(fieldValidators, allowNoLines) {
  return yup.object().shape({
    ...Object.keys(fieldValidators).reduce((shape, field) => {
      console.log(this.options.context?.maxAccess)

      shape[field] = yup.mixed().nullable().test(conditionalField(fieldValidators, field, allowNoLines))

      return shape
    }, {})
  })
}

export { createConditionalSchema }
