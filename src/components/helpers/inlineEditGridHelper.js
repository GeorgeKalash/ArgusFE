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
  let seqNo = 0
  if (dataRows && dataRows.length > 0) {
    return dataRows?.map(row => {
      return { ...row, id: seqNo++ }
    })
  } else {
    return [{ id: 0 }]
  }
}

export const getValueForCountryName = (params, productCountriesGridData) => {
  const { api, cellMode, colDef, field, hasFocus, id, row, rowNode, tabIndex, value } = params
  const record = productCountriesGridData.find(entry => entry.countryRef === row.countryRef)
  if (record) return record?.countryName
  else ''
}

export const countriesGetUpdatedRowFunction = (newRow, dataList) => {
  const countryRef = newRow.countryRef
  const record = dataList.find(entry => entry.countryRef === countryRef)
  const newCountryName = record.countryName
  const updatedRow = { ...newRow, countryName: newCountryName, isNew: false }

  return updatedRow
}

export const monetaryGetUpdatedRowFunction = newRow => {
  return { ...newRow }
}

export const filterCountries = countriesList => {
  return countriesList.filter(country => country.isInactive === false)
}
