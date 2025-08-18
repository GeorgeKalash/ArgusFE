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

const getFormattedNumber = (value, decimal, round = false, viewDecimal = false) => {
  if (!value && value !== 0) return

  const sanitizedValue = value.toString().replace(/[^0-9.-]/g, '')

  const [integerPart, decimalPart] = sanitizedValue.split('.')

  const formattedIntegerPart = new Intl.NumberFormat('en-US').format(integerPart)

  let formattedDecimalPart = ''

  if (decimalPart !== undefined) {
    if (decimal !== undefined) {
      if (!round) {
        let sliced = decimalPart.slice(0, decimal)
        formattedDecimalPart = viewDecimal ? `.${sliced.padEnd(decimal, '0')}` : `.${sliced.replace(/0+$/, '')}`
      } else {
        const rounded = parseFloat(`0.${decimalPart}`).toFixed(decimal).split('.')[1]
        formattedDecimalPart = viewDecimal ? `.${rounded}` : `.${rounded.replace(/0+$/, '')}`
      }
    } else {
      formattedDecimalPart = `.${decimalPart}`
    }
  }

  let formattedValue = `${formattedIntegerPart}${formattedDecimalPart}`

  if (decimal !== undefined && decimal >= 0 && !formattedValue.includes('.') && viewDecimal) {
    formattedValue += '.' + '0'.repeat(decimal)
  }

  if (formattedValue.endsWith('.')) {
    formattedValue = formattedValue.slice(0, -1)
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
  const sanitizedValue = value && value.replace(/,/g, '')

  return sanitizedValue
}

export { getFormattedNumber, validateNumberField, getNumberWithoutCommas, getFormattedNumberMax }
