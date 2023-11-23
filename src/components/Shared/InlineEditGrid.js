import React, { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Autocomplete, Box, Checkbox, FormControlLabel, IconButton, TextField } from '@mui/material'
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
      case 'textfield':
        return (
          <CustomTextField
            id={cellId} // Attach the unique identifier as the input's ID
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][fieldName]}
            required={column?.mandatory}
            onChange={event => {
              const newValue = event.target.value
              gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, newValue)
            }}
            readOnly={column?.readOnly}
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

                return selectedOption[column.displayField]
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
              gridValidation.setFieldValue(
                `rows[${rowIndex}].${column.fieldToUpdate}`,
                newValue ? newValue[column.fieldToUpdate] : newValue
              )
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

      default:
        return
    }
  }

  const handleKeyDown = (e, columnIndex, rowIndex) => {
    const { key } = e
    if (key === 'Tab' && columnIndex === columns.length - 1) {
      if (rowIndex === gridValidation.values.rows.length - 1 && lastRowIsValid()) {
        gridValidation.setFieldValue('rows', [...gridValidation.values.rows, defaultRow])
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
                console.log(typeof row[column.name])

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
                    {typeof row[column.name] === 'boolean' ? JSON.stringify(row[column.name]) : row[column.name]}
                  </Box>
                )
              }}
              editor={options => (
                <Box onKeyDown={e => handleKeyDown(e, i, options.rowIndex)}>
                  {cellEditor(column.field, options, options.rowIndex, column)}
                </Box>
              )}
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
