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

const InlineEditGrid = props => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState([false, null])

  const columns = props.columns
  const defaultRow = props.defaultRow
  const initialData = props.initialData && props.initialData.length > 0 ? props.initialData : [defaultRow]

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
            store={column.store}
            valueField={column.valueField}
            displayField={column.displayField}
            getOptionBy={gridValidation.values.rows[rowIndex][`${fieldName}Id`]}
            value={gridValidation.values.rows[rowIndex][`${fieldName}Id`]}
            onChange={(event, newValue) => {
              console.log('ComboBox onChange:', event, newValue)

              gridValidation.setFieldValue(
                `rows[${rowIndex}].${fieldName}Id`,
                newValue ? newValue[valueField] : newValue
              )
              gridValidation.setFieldValue(
                `rows[${rowIndex}].${fieldName}Name`,
                newValue ? newValue[displayField] : newValue
              )
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
      rows: initialData
    },
    validationSchema: yup.object({}),
    onSubmit: values => {
      console.log({ SUBMIT: values })
    }
  })

  const handleKeyDown = (e, field, rowIndex) => {
    const { key } = e

    if (key === 'Tab' && field === columns[columns.length - 1].field) {
      if (rowIndex === gridValidation.values.rows.length - 1) {
        gridValidation.setFieldValue('rows', [...gridValidation.values.rows, defaultRow])
      }
    }
  }

  const handleDelete = rowIndex => {
    if (gridValidation.values.rows.length === 1) {
      gridValidation.setFieldValue('rows', [defaultRow])
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
