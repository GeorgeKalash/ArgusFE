import React, { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Box, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomTextField from '../Inputs/CustomTextField'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import CustomComboBox from '../Inputs/CustomComboBox'
import DeleteDialog from './DeleteDialog'

const InlineEditGrid = () => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState([false, null])

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
            id={cellId}
            name={fieldName}
            store={comboStore}
            valueField='recordId'
            displayField='name'
            getOptionBy={gridValidation.values.rows[rowIndex][`${fieldName}Id`]}
            value={gridValidation.values.rows[rowIndex][`${fieldName}Id`]}
            onChange={(event, newValue) => {
              console.log('ComboBox onChange:', event, newValue)
              gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}Id`, newValue?.recordId)
              gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}Name`, newValue?.name)
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
          stateId: 1,
          stateName: 'State 1'
        },
        {
          countryRef: 'USA -2',
          countryName: 'United States -2',
          stateId: 2,
          stateName: 'State 2'
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
          stateId: 1,
          stateName: 'State 1'
        }

        gridValidation.setFieldValue('rows', [...gridValidation.values.rows, newRow])
      }
    }
  }

  const handleDelete = rowIndex => {
    if (gridValidation.values.rows.length === 1) {
      gridValidation.setFieldValue('rows', [
        {
          countryRef: '',
          countryName: '',
          stateId: 1,
          stateName: 'State 1'
        }
      ])
    } else {
      const updatedRows = gridValidation.values.rows.filter((row, index) => index !== rowIndex)
      gridValidation.setFieldValue('rows', updatedRows)
    }
  }

  const openDeleteDialog = rowIndex => {
    setDeleteDialogOpen([true, rowIndex])
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen([false, null])
  }

  const handleDeleteConfirmation = rowIndex => {
    handleDelete(rowIndex)
    closeDeleteDialog()
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
              style={{ minWidth: '25%' }}
              editor={options => (
                <div onKeyDown={e => handleKeyDown(e, column.field, options.rowIndex)}>
                  {cellEditor(column.field, options, options.rowIndex, column)}
                </div>
              )}

              // ... (previous code)
            />
          )
        })}
        <Column
          key='actions'
          body={(rowData, column) => {
            return (
              <div>
                <IconButton icon='pi pi-trash' onClick={() => openDeleteDialog(column.rowIndex)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            )
          }}
          style={{ maxWidth: '60px' }}
        />
      </DataTable>

      <DeleteDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirmation}
        rowIndex={isDeleteDialogOpen}
      />
    </Box>
  )
}

export default InlineEditGrid
