import React, { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, IconButton, TextField, Paper } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomTextField from '../Inputs/CustomTextField'
import DeleteDialog from './DeleteDialog'
import Icon from 'src/@core/components/icon'

const CustomPaper = (props, length) => {
  return <Paper sx={{ position: 'absolute', width: `${length}40%`, zIndex: 999, mt: 1 }} {...props} />
}

const InlineEditGrid = ({
  columns,
  defaultRow,
  gridValidation,
  tableWidth,
  allowDelete = true,
  allowAddNewLine = true,
  onDelete
}) => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState([false, null])

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
            PaperComponent={props =>
              column.columnsInDropDown &&
              column.columnsInDropDown.length > 0 &&
              CustomPaper(props, column.columnsInDropDown.length)
            }
            renderOption={(props, option) => {
              if (column.columnsInDropDown && column.columnsInDropDown.length > 0)
                return (
                  <Box>
                    {props.id.endsWith('-0') && (
                      <li className={props.className}>
                        {column.columnsInDropDown.map((header, i) => {
                          return (
                            <Box key={i} sx={{ flex: 1 }}>
                              {header.value.toUpperCase()}
                            </Box>
                          )
                        })}
                      </li>
                    )}
                    <li {...props}>
                      {column.columnsInDropDown.map((header, i) => {
                        return (
                          <Box key={i} sx={{ flex: 1 }}>
                            {option[header.key]}
                          </Box>
                        )
                      })}
                    </li>
                  </Box>
                )
            }}
            fullWidth={true}
            renderInput={params => <TextField {...params} required={column?.mandatory} sx={{ flex: 1 }} />}
          />
        )
      case 'lookup':
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
            PaperComponent={props =>
              column.columnsInDropDown &&
              column.columnsInDropDown.length > 0 &&
              CustomPaper(props, column.columnsInDropDown.length)
            }
            renderOption={(props, option) => {
              if (column.columnsInDropDown && column.columnsInDropDown.length > 0)
                return (
                  <Box>
                    {props.id.endsWith('-0') && (
                      <li className={props.className}>
                        {column.columnsInDropDown.map((header, i) => {
                          return (
                            <Box key={i} sx={{ flex: 1 }}>
                              {header.value.toUpperCase()}
                            </Box>
                          )
                        })}
                      </li>
                    )}
                    <li {...props}>
                      {column.columnsInDropDown.map((header, i) => {
                        return (
                          <Box key={i} sx={{ flex: 1 }}>
                            {option[header.key]}
                          </Box>
                        )
                      })}
                    </li>
                  </Box>
                )
            }}
            fullWidth={true}
            renderInput={params => (
              <TextField
                {...params}
                onChange={e => (e.target.value ? column.onLookup && column.onLookup(e.target.value) : column.onClear())}
                required={column?.mandatory}
                sx={{ flex: 1 }}
              />
            )}
          />
        )
      case 'checkbox':
        return (
          <Box
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Checkbox
              id={cellId}
              name={fieldName}
              checked={gridValidation.values.rows[rowIndex][fieldName]}
              value={gridValidation.values.rows[rowIndex][fieldName]}
              onChange={(event, newValue) => {
                gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, newValue)
              }}
            />
          </Box>
        )
      case 'button':
        return (
          <Button id={cellId} sx={{ height: '30px' }} onClick={e => column.onClick(e, row.rowData)} variant='contained'>
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

  const handleIncrementedFieldsOnDelete = (deletedRow, replacementRow) => {
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].field === 'incremented') {
        const fieldName = columns[i].name
        replacementRow[fieldName] = deletedRow[fieldName]
      }
    }
  }

  const handleDelete = rowIndex => {
    if (gridValidation.values.rows.length === 1) {
      gridValidation.setFieldValue('rows', [defaultRow])
    } else {
      // if (gridValidation.values.rows[rowIndex + 1]) {
      //   handleIncrementedFieldsOnDelete(gridValidation.values.rows[rowIndex], gridValidation.values.rows[rowIndex + 1])
      // }
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
    onDelete && onDelete()
    closeDeleteDialog()
  }

  return (
    <Box>
      <DataTable value={gridValidation?.values?.rows} editMode='cell' tableStyle={{ minWidth: tableWidth }}>
        {columns.map((column, i) => {
          return (
            <Column
              key={column.field}
              field={column.name}
              header={column.header}
              style={{
                width: column.width || tableWidth / columns.length
              }}
              body={row => {
                return (
                  <Box
                    sx={{
                      height: '30px',
                      border:
                        (row[column.name] === '' || row[column.name] === null) && column?.mandatory
                          ? '1px solid red'
                          : 'none'
                    }}
                  >
                    {column.field === 'checkbox' && (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {row[column.name] ? (
                          <Icon icon='mdi:check-circle-outline' />
                        ) : (
                          <Icon icon='mdi:radiobox-blank' />
                        )}
                      </Box>
                    )}
                    {column.field === 'button' && (
                      <Button sx={{ height: '30px' }} onClick={e => column.onClick(e, row)} variant='contained'>
                        {column.text}
                      </Button>
                    )}
                    {typeof row[column.name] != 'boolean' && row[column.name]}
                  </Box>
                )
              }}
              editor={options => {
                return (
                  <Box
                    sx={{ display: 'flex' }}
                    onKeyDown={e => allowAddNewLine && handleKeyDown(e, i, options.rowIndex)}
                  >
                    {cellEditor(column.field, options, options.rowIndex, column)}
                  </Box>
                )
              }}
            />
          )
        })}
        {allowDelete && (
          <Column
            key='actions'
            ref={null}
            body={(rowData, column) => {
              return (
                <div ref={null}>
                  <IconButton tabIndex='-1' icon='pi pi-trash' onClick={() => openDeleteDialog(column.rowIndex)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              )
            }}
            style={{ maxWidth: '60px' }}
          />
        )}
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
