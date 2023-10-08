const getFormattedNumber = (value, decimal) => {

    if (!value)
        return

    // Remove non-numeric and non-decimal characters
    const sanitizedValue = value.replace(/[^0-9.]/g, '')

    // Split the value into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedValue.split('.')

    // Format the integer part with commas
    const formattedIntegerPart = new Intl.NumberFormat('en-US').format(integerPart)

    let formattedDecimalPart = '';

    // If there is a decimal part
    // ensure it has exactly as much decimal places as required
    if (decimalPart !== undefined) {
        if (decimal !== undefined) {
            formattedDecimalPart = `.${decimalPart.slice(0, decimal)}`;
        } else {
            formattedDecimalPart = `.${decimalPart}`;
        }
    }

    // Combine the formatted parts
    const formattedValue = `${formattedIntegerPart}${formattedDecimalPart}`

    return formattedValue
}

const validateNumberField = (value, originalValue) => {
    if (typeof originalValue === 'string') {
        // Remove commas from the value
        const sanitizedValue = originalValue.replace(/,/g, '');

        // Handle decimals with or without leading zero
        if (sanitizedValue.includes('.')) {
            return parseFloat(sanitizedValue);
        } else {
            return parseInt(sanitizedValue, 10);
        }
    }

    return value;
}

const getNumberWithoutCommas = (value) => {
    // Remove commas from the value string
    const sanitizedValue = value.replace(/,/g, '')

    return sanitizedValue
}

export {
    getFormattedNumber,
    validateNumberField,
    getNumberWithoutCommas
}