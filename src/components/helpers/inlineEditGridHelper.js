export const getOptionLabel = (option, displayProperties) => {
  const labelParts = []
  if (displayProperties) {
    for (const prop of displayProperties) {
      if (option.hasOwnProperty(prop)) {
        labelParts.push(option[prop])
      }
    }
  }

  const label = labelParts.join('-')

  return label
}

export function getDefaultValue(currentColumn, data) {
  const column = data[0].columns.find(col => col.name === 'countryRef')
  if (column) {
    const value = column.value
    const record = currentColumn.fieldStore.findIndex(entry => entry[currentColumn.valueProperty] === value)
    return currentColumn.fieldStore[record]
  } else {
    return null
  }
}
