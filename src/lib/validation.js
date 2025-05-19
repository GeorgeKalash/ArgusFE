import * as yup from 'yup'

function conditionalField(fieldValidators) {
  return function (value) {
    const row = this.parent
    const currentField = this.path
    const fieldKey = currentField.split('.').pop()

    const isAnyFieldFilled = Object.entries(fieldValidators).some(([, fn]) => {
      return !!fn(row)
    })

    if (!isAnyFieldFilled) return true

    const isCurrentFieldFilled = fieldValidators[fieldKey] ? !!fieldValidators[fieldKey](row) : !!value

    return isCurrentFieldFilled
  }
}

function createConditionalSchema(fieldValidators) {
  return yup.object().shape(
    Object.keys(fieldValidators).reduce((shape, field) => {
      shape[field] = yup.mixed().nullable().test(conditionalField(fieldValidators))

      return shape
    }, {})
  )
}

export { createConditionalSchema }
