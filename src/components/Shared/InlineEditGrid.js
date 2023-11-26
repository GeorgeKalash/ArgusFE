import React, { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, IconButton, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomTextField from '../Inputs/CustomTextField'
import DeleteDialog from './DeleteDialog'

const InlineEditGrid = props => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState([false, null])

  const columns = props.columns
  const defaultRow = props.defaultRow
  const gridValidation = props.gridValidation

  const cellEditor = (field, row, rowIndex, column) => {
    if (!row.rowData) return
    const fieldName = row.field
    const cellId = `table-cell-${rowIndex}-${column.id}` // Unique identifier for the cell

    switch (field) {
      case 'incremented':
        return (
          <CustomTextField
            id={cellId}
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][fieldName]}
            required={true}
            readOnly={true}
          />
        )
      case 'textfield':
        return (
          <CustomTextField
            id={cellId}
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][fieldName]}
            required={column?.mandatory}
            readOnly={column?.readOnly}
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
          <Autocomplete
            id={cellId}
            size='small'
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][`${column.nameId}`]}
            options={column.store}
            getOptionLabel={option => {
              if (typeof option === 'object') return option[column.displayField]
              else {
                const selectedOption = column.store.find(item => {
                  return item[column.valueField] === option
                })
                if (selectedOption) return selectedOption[column?.displayField]
                else return ''
              }
            }}
            isOptionEqualToValue={(option, value) => {
              return option[column.valueField] == gridValidation.values.rows[rowIndex][`${column.nameId}`]
            }}
            onChange={(event, newValue) => {
              event.stopPropagation()
              gridValidation.setFieldValue(
                `rows[${rowIndex}].${column.nameId}`,
                newValue ? newValue[column.valueField] : newValue
              )
              gridValidation.setFieldValue(
                `rows[${rowIndex}].${column.name}`,
                newValue ? newValue[column.displayField] : newValue
              )

              if (column.fieldsToUpdate && column.fieldsToUpdate.length > 0) {
                const fieldsToUpdate = column.fieldsToUpdate
                for (let i = 0; i < fieldsToUpdate.length; i++) {
                  gridValidation.setFieldValue(
                    `rows[${rowIndex}].${fieldsToUpdate[i].to}`,
                    newValue ? newValue[fieldsToUpdate[i].from] : newValue
                  )
                }
              }
            }}
            renderInput={params => <TextField {...params} required={column?.mandatory} />}
          />
        )
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                name={fieldName}
                checked={gridValidation.values.rows[rowIndex][fieldName]}
                value={gridValidation.values.rows[rowIndex][fieldName]}
                onChange={(event, newValue) => {
                  gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, newValue)
                }}
              />
            }
          />
        )
      case 'button':
        return (
          <Button sx={{ height: '30px' }} onClick={column.onClick} variant='contained'>
            {column.text}
          </Button>
        )

      default:
        return
    }
  }

  const handleKeyDown = (e, columnIndex, rowIndex) => {
    const { key } = e
    if (key === 'Tab' && columnIndex === columns.length - 1) {
      if (rowIndex === gridValidation.values.rows.length - 1 && lastRowIsValid()) {
        gridValidation.setFieldValue('rows', [
          ...gridValidation.values.rows,
          {
            ...defaultRow,
            ...handleIncrementedFieldsOnAdd()
          }
        ])
      }
    }
  }

  const lastRowIsValid = () => {
    const lastRow = gridValidation.values.rows[gridValidation.values.rows.length - 1]

    for (let i = 0; i < columns.length; i++) {
      const columnName = columns[i].name

      if (columns[i]?.mandatory && !lastRow[columnName]) {
        return false
      }
    }

    return true
  }

  const handleIncrementedFieldsOnAdd = () => {
    const result = {}
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].field === 'incremented') {
        const fieldName = columns[i].name
        const value = columns[i].valueSetter()
        result[fieldName] = value
      }
    }

    return result
  }

  const handleIncrementedFieldsOnDelete = () => {
    const result = {}
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].field === 'incremented') {
        const fieldName = columns[i].name
        const value = columns[i].valueSetter()
        result[fieldName] = value
      }
    }

    return result
  }

  const handleDelete = rowIndex => {
    const rows = gridValidation.values.rows

    if (rows.length === 1) {
      gridValidation.setFieldValue('rows', [defaultRow])
    } else {
      const updatedRows = rows.filter((row, index) => index !== rowIndex)
      if (rows[rowIndex + 1]) {
        // If not the last row, handle incremented fields for the replacement row
        const incrementedFields = handleIncrementedFieldsOnDelete()

        const updatedReplacementRow = {
          ...rows[rowIndex + 1],
          ...incrementedFields
        }
        updatedRows[rowIndex] = updatedReplacementRow
      }
      gridValidation.setFieldValue('rows', updatedRows)
    }
  }

  // const handleDelete = rowIndex => {
  //   if (gridValidation.values.rows.length === 1) {
  //     gridValidation.setFieldValue('rows', [defaultRow])
  //   } else {
  //     const updatedRows = gridValidation.values.rows.filter((row, index) => index !== rowIndex)
  //     gridValidation.setFieldValue('rows', updatedRows)
  //   }
  // }

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

  return (
    <Box>
      <DataTable value={gridValidation?.values?.rows} editMode='cell' tableStyle={{ minWidth: '600px' }}>
        {columns.map((column, i) => {
          return (
            <Column
              key={column.field}
              field={column.name}
              header={column.header}
              style={{
                width: column.width || '200px'
              }}
              body={row => {
                return (
                  <Box
                    style={{
                      height: '30px',
                      border:
                        (row[column.name] === '' || row[column.name] === null) && column?.mandatory
                          ? '1px solid red'
                          : 'none'
                    }}
                  >
                    {column.field === 'button' && (
                      <Button sx={{ height: '30px' }} onClick={column.onClick} variant='contained'>
                        {column.text}
                      </Button>
                    )}
                    {typeof row[column.name] === 'boolean' ? JSON.stringify(row[column.name]) : row[column.name]}
                  </Box>
                )
              }}
              editor={options => {
                return (
                  <Box onKeyDown={e => handleKeyDown(e, i, options.rowIndex)}>
                    {cellEditor(column.field, options, options.rowIndex, column)}
                  </Box>
                )
              }}
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
