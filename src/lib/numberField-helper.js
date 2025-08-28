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

const formatValue = val => {
  if (!val && val !== 0) return ''

  return String(val)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?[1-9])0+$/, '$1')
}

const getFormattedNumber = (value, decimal, round = false, hideLeadingZeros = false) => {
  if (!value && value !== 0) return

  const sanitizedValue = String(value).replace(/[^0-9.-]/g, '')

  const [integerPart, decimalPart] = sanitizedValue.split('.')

  let formattedValue

  if (decimalPart !== undefined) {
    if (decimal !== undefined) {
      if (!round) {
        const formattedIntegerPart = new Intl.NumberFormat('en-US').format(integerPart)
        formattedValue = `${formattedIntegerPart}.${decimalPart.slice(0, decimal)}`
      } else
        formattedValue = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimal,
          maximumFractionDigits: decimal
        }).format(Number(sanitizedValue))
    } else {
      const formattedIntegerPart = new Intl.NumberFormat('en-US').format(integerPart)
      formattedValue = `${formattedIntegerPart}.${decimalPart}`
    }
  } else {
    if (decimal) {
      formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      }).format(Number(sanitizedValue))
    } else {
      formattedValue = new Intl.NumberFormat('en-US').format(integerPart)
    }
  }

  return hideLeadingZeros ? formatValue(formattedValue) : formattedValue
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
  const sanitizedValue = value && value.replace(/,/g, '')

  return sanitizedValue
}

export { getFormattedNumber, validateNumberField, getNumberWithoutCommas, getFormattedNumberMax }
