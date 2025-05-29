import * as yup from 'yup'

function conditionalField(fieldValidators) {
  return function (value) {
    const row = this.parent
    const currentField = this.path
    const fieldKey = currentField.split('.').pop()

    console.log('ffff', fieldValidators(row))

    if (typeof fieldValidators === 'function') {
      return fieldValidators(row)
    }

    if (row[fieldKey] !== null && fieldValidators[fieldKey] !== '' && !fieldValidators[fieldKey](row)) {
      return false
    }

    const isAnyFieldFilled = Object.entries(fieldValidators).some(([, fn]) => {
      return !!fn(row)
    })

    if (!isAnyFieldFilled) return true

    return !!fieldValidators[fieldKey](row)
  }
}

function createConditionalSchema(fieldValidators, otherValidation, isRequired) {
  if (typeof fieldValidators === 'function') {
    console.log('ffff')

    return conditionalField(fieldValidators)
  } else
    return yup.object().shape({
      ...Object.keys(fieldValidators).reduce((shape, field) => {
        shape[field] = yup.mixed().nullable().test(conditionalField(fieldValidators, isRequired))

        return shape
      }, {}),
      ...otherValidation
    })
}

export { createConditionalSchema }
