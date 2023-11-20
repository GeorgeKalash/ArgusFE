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

export function getDefaultValue(currentColumn, data, setData) {
  const column = data[0].columns.find(col => col.name === 'countryRef')
  if (column) {
    const value = column.value
    const record = currentColumn.fieldStore.findIndex(entry => entry[currentColumn.valueProperty] === value)

    let updatedData = [
      ...data,
      (data[0].columns.find(col => col.name === 'countryName').value = currentColumn.fieldStore[record])
    ]

    // setData(updatedData)
    return currentColumn.fieldStore[record]
  } else {
    return null
  }
}

export const transformRowsForEditableGrid = dataRows => {
  let rowCount = 0
  if (dataRows && dataRows.length > 0) {
    return dataRows?.map(row => {
      return { ...row, id: rowCount++ }
    })
  } else {
    return [{ id: 0 }]
  }
}

export const countriesGetUpdatedRowFunction = (newRow, dataList) => {
  //any modifications 
  const updatedRow = { ...newRow  }

  return updatedRow
}

export const monetaryGetUpdatedRowFunction = newRow => {
  return { ...newRow }
}

export const filterCountries = countriesList => {
  return countriesList.filter(country => country.isInactive === false)
}
