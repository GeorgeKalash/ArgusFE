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
    { field: 'textfield', header: 'Country Ref', name: 'countryRef', mandatory: true },
    { field: 'textfield', header: 'Country Name', name: 'countryName' },
    { field: 'combobox', header: 'State', name: 'state' }
  ]

  const comboStore = [
    { recordId: 0, name: 'zero' },
    { recordId: 1, name: 'one' },
    { recordId: 2, name: 'two' }
  ]

  const cellEditor = (field, row, rowKey) => {
    if (!row.rowData) return
    const fieldName = row.field
    switch (field) {
      case 'textfield':
        return (
          <CustomTextField
            name={fieldName}
            value={gridValidation.values.rows[rowKey][fieldName]}
            onChange={event => {
              const newValue = event.target.value
              gridValidation.setFieldValue(`rows[${rowKey}].${fieldName}`, newValue)
            }}
            onClear={() => {
              const updatedRows = [...gridValidation.values.rows]
              updatedRows[rowKey][fieldName] = ''
              gridValidation.setFieldValue('rows', updatedRows)
            }}
          />
        )
      case 'combobox':
        return (
          <CustomComboBox
            name={fieldName}
            store={comboStore}
            valueField='recordId'
            displayField='name'
            getOptionBy={gridValidation.values.rows[rowKey][fieldName]}
            value={comboStore.filter(item => item.recordId === gridValidation.values.rows[rowKey][fieldName])[0]}
            onChange={(event, newValue) => {
              gridValidation.setFieldValue(`rows[${rowKey}].${fieldName}`, newValue)
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
        }
      ]
    },
    validationSchema: yup.object({}),
    onSubmit: values => {
      console.log({ SUBMIT: values })
    }
  })

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
              editor={options => cellEditor(column.field, options, 0)} //replace 0
              // onCellEditComplete={e => console.log({ EVENT: e })}
            />
          )
        })}
      </DataTable>
    </Box>
  )
}

export default InlineEditGrid
