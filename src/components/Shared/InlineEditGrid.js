import React from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Box } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import CustomComboBox from '../Inputs/CustomComboBox'

const InlineEditGrid = () => {
  const columns = [
    { id: 0, field: 'textfield', header: 'Country Ref', name: 'countryRef', mandatory: true },
    { id: 1, field: 'textfield', header: 'Country Name', name: 'countryName' },
    { id: 2, field: 'combobox', header: 'State', name: 'state' }
  ]

  const comboStore = [
    { recordId: 0, name: 'zero' },
    { recordId: 1, name: 'one' },
    { recordId: 2, name: 'two' }
  ]

  const cellEditor = (field, row, rowIndex, column) => {
    if (!row.rowData) return
    const fieldName = row.field
    const cellId = `table-cell-${rowIndex}-${column.id}` // Unique identifier for the cell

    switch (field) {
      case 'textfield':
        return (
          <CustomTextField
            id={cellId} // Attach the unique identifier as the input's ID
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][fieldName]}
            onChange={event => {
              const newValue = event.target.value
              gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, newValue)
            }}
            onClear={() => {
              const updatedRows = [...gridValidation.values.rows]
              updatedRows[rowIndex][fieldName] = ''
              gridValidation.setFieldValue('rows', updatedRows)
            }}
          />
        )
      case 'combobox':
        return (
          <CustomComboBox
            id={cellId} // Attach the unique identifier as the input's ID
            name={fieldName}
            store={comboStore}
            valueField='recordId'
            displayField='name'
            getOptionBy={gridValidation.values.rows[rowIndex][fieldName]}
            value={comboStore.filter(item => item.recordId === gridValidation.values.rows[rowIndex][fieldName])[0]}
            onChange={(event, newValue) => {
              gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, newValue)
            }}
          />
        )

      default:
        return
    }
  }

  const gridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          countryRef: 'USA',
          countryName: 'United States',
          state: 1
        },
        {
          countryRef: 'USA -2',
          countryName: 'United States -2',
          state: 2
        }
      ]
    },
    validationSchema: yup.object({}),
    onSubmit: values => {
      console.log({ SUBMIT: values })
    }
  })

  const handleKeyDown = (e, field, rowIndex) => {
    const { key } = e

    if (key === 'Tab' && field === columns[columns.length - 1].field) {
      // Check if the Tab press is on the last row
      if (rowIndex === gridValidation.values.rows.length - 1) {
        // const newRow = {
        //   countryRef: '',
        //   countryName: '',
        //   state: null // Assuming null for the initial state value
        // }
        const newRow = {
          countryRef: '',
          countryName: '',
          state: null
        }

        gridValidation.setFieldValue('rows', [...gridValidation.values.rows, newRow])
      }
    }
  }

  console.log({ gridValidation: gridValidation.values })

  return (
    <Box>
      <DataTable value={gridValidation.values.rows} editMode='cell' tableStyle={{ minWidth: '600px' }}>
        {columns.map((column, i) => {
          return (
            <Column
              key={column.field}
              field={column.name}
              header={column.header}
              style={{ width: '25%' }}
              editor={options => (
                <div onKeyDown={e => handleKeyDown(e, column.field, options.rowIndex)}>
                  {cellEditor(column.field, options, options.rowIndex, column)}
                </div>
              )}

              // editor={options => cellEditor(column.field, options, 0)} //replace 0
              // onKeyDown={e => console.log({ e })}
              // onCellEditComplete={e => console.log({ EVENT: e })}
            />
          )
        })}
      </DataTable>
    </Box>
  )
}

export default InlineEditGrid
