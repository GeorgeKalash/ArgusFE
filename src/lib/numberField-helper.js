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

  // Remove non-numeric and non-decimal characters (but preserving minus sign for negative numbers)
  const sanitizedValue = value.toString().replace(/[^0-9.-]/g, '')

  // Split the value into integer and decimal parts
  const [integerPart, decimalPart] = sanitizedValue.split('.')

  // Format the integer part with commas
  const formattedIntegerPart = new Intl.NumberFormat('en-US').format(integerPart)

  let formattedDecimalPart = ''
  let formattedValue = ''

  if (decimalPart !== undefined) {
    if (decimal !== undefined) {
      formattedDecimalPart = `.${decimalPart.slice(0, decimal)}`
    } else {
      formattedDecimalPart = `.${decimalPart}`
    }
    formattedValue = `${formattedIntegerPart}${formattedDecimalPart}`
  } else {
    if (decimal) {
      formattedValue = parseInt(formattedIntegerPart)?.toFixed(decimal)
    }
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
