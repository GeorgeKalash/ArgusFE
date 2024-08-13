export function handleChangeNumber(inputValue, digitsBeforePoint, digitsAfterPoint, validation, setPosition, param) {
  const formattedValue = inputValue.value
    ? getFormattedNumberMax(inputValue.value, digitsBeforePoint, digitsAfterPoint)
    : inputValue.value

  // Save current cursor position
  const currentPosition = inputValue.selectionStart

  // Update field value
  validation.setFieldValue(param, formattedValue)

  const newCursorPosition = currentPosition + (formattedValue && formattedValue.length - inputValue.value.length)

  setPosition(newCursorPosition)
}

const getFormattedNumber = (value, decimal) => {
  if (!value && value !== 0) return

  const sanitizedValue = value.toString().replace(/[^0-9.-]/g, '')

  const [integerPart, decimalPart] = sanitizedValue.split('.')

  const formattedIntegerPart = new Intl.NumberFormat('en-US').format(integerPart)

  let formattedDecimalPart = ''

  if (decimalPart !== undefined) {
    if (decimal !== undefined) {
      formattedDecimalPart = `.${decimalPart.slice(0, decimal)}`
    } else {
      formattedDecimalPart = `.${decimalPart}`
    }
  }

  let formattedValue = `${formattedIntegerPart}${formattedDecimalPart}`

  if (decimal !== undefined && decimal >= 0 && !formattedValue.includes('.')) {
    formattedValue += '.' + '0'.repeat(decimal)
  }

  return formattedValue
}

function getFormattedNumberMax(number, digitsBeforePoint, digitsAfterPoint) {
  if (!number) return
  const value = number.toString().replace(/[^0-9.]/g, '')
  var parts = value.split('.')

  var beforePoint = parts[0].slice(0, digitsBeforePoint)
  var afterPoint = (parts[1] || '').slice(0, digitsAfterPoint)
  beforePoint = new Intl.NumberFormat('en-US').format(beforePoint)
  console.log(beforePoint)
  if (value?.indexOf('.') > -1) {
    return beforePoint + '.' + afterPoint
  } else {
    return beforePoint
  }
}

const validateNumberField = (value, originalValue) => {
  if (typeof originalValue === 'string') {
    // Remove commas from the value
    const sanitizedValue = originalValue.replace(/,/g, '')

    // Handle decimals with or without leading zero
    if (sanitizedValue.includes('.')) {
      return parseFloat(sanitizedValue)
    } else {
      return parseInt(sanitizedValue, 10)
    }
  }

  return value
}

const getNumberWithoutCommas = value => {
  const sanitizedValue = value && value.toString().replace(/,/g, '')

  return sanitizedValue
}

export { getFormattedNumber, validateNumberField, getNumberWithoutCommas, getFormattedNumberMax }
