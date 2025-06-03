import * as yup from 'yup'

function conditionalField(fieldValidators, fieldKey) {
  return function () {
    const row = this.parent

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
      return !!(fn(row) && row[fieldKey] !== 0)
    })

    if (!isAnyFieldFilled) return true

    return !!fieldValidators[fieldKey](row)
  }
}

function createConditionalSchema(fieldValidators) {
  return yup.object().shape({
    ...Object.keys(fieldValidators).reduce((shape, field) => {
      shape[field] = yup.mixed().nullable().test(conditionalField(fieldValidators, field))

      return shape
    }, {})
  })
}

export { createConditionalSchema }
