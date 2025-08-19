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
  if (isNaN(val)) return val

  return String(val)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?[1-9])0+$/, '$1')
}

const getFormattedNumber = (inputValue, decimal = 0, round = false, hideLeadingZeros = false) => {
  const rawValue = hideLeadingZeros ? inputValue : formatValue(inputValue)
  if (rawValue === undefined || rawValue === null || rawValue === '') return
  const sanitized = rawValue.toString().replace(/[^0-9.-]/g, '')
  let [integerPart = '0', decimalPart = ''] = sanitized.split('.')
  const formattedInt = new Intl.NumberFormat('en-US').format(integerPart)
  let formattedDec = ''

  if (decimalPart) {
    if (round) {
      const rounded = Number(`0.${decimalPart}`).toFixed(decimal).split('.')[1]
      formattedDec = `.${hideLeadingZeros ? rounded.replace(/0+$/, '') : rounded}`
    } else {
      let sliced = decimal ? decimalPart.slice(0, decimal) : decimalPart
      if (!hideLeadingZeros) sliced = sliced.padEnd(decimal, '0')
      formattedDec = sliced ? `.${sliced}` : ''
      console.log('hideLeadingZeros two', inputValue)
    }
  }

  let result = `${formattedInt}${formattedDec}`
  if (decimal && !result.includes('.') && !hideLeadingZeros) result += '.' + '0'.repeat(decimal)

  return result.endsWith('.') ? result.slice(0, -1) : result
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
