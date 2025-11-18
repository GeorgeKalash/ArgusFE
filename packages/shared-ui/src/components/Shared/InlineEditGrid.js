import React, { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Autocomplete, Box, Button, Checkbox, IconButton, TextField, Paper, InputAdornment } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomTextField from '../Inputs/CustomTextField'
import DeleteDialog from './DeleteDialog'
import Icon from 'src/@core/components/icon'
import { getFormattedNumber, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import SearchIcon from '@mui/icons-material/Search'
import { options } from '@fullcalendar/core/preact'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import EventIcon from '@mui/icons-material/Event'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { formatDateFromApi, formatDateFromApiInline, formatDateDefault } from 'src/lib/date-helper'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { fontSize } from '@mui/system'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY, accessLevel } from 'src/services/api/maxAccess'

const CustomPaper = (props, widthDropDown) => {
  return <Paper sx={{ width: `${widthDropDown ? widthDropDown + '%' : 'auto'}` }} {...props} />
}

const dateFormat =
  typeof window !== 'undefined' &&
  window.localStorage.getItem('default') &&
  JSON.parse(window.localStorage.getItem('default'))['dateFormat']

const InlineEditGrid = ({
  columns,
  defaultRow,
  gridValidation,
  width,
  background,
  scrollHeight,
  scrollable = true,
  allowDelete = true,
  allowAddNewLine = true,
  onDelete,
  maxAccess
}) => {
  const [write, setWrite] = useState(false)

  const tableWidth = width
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState([false, null])

  const cellRender = (row, column) => {
    switch (column.field) {
      case 'numberfield':
        return (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'right',
              alignItems: 'right'
            }}
          >
            {row[column.name] === 0 ? row[column.name] : getFormattedNumber(row[column.name])}
          </Box>
        )
      case 'checkbox':
        return (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {row[column.name] ? <Icon icon='mdi:checkbox-marked' /> : <Icon icon='mdi:checkbox-blank-outline' />}
          </Box>
        )
      case 'button':
        return (
          <Button sx={{ height: '30px' }} onClick={e => column.onClick(e, row)} variant='contained'>
            {column.text}
          </Button>
        )

      case 'combobox':
        return row[column.name]
          ? typeof row[column.name] === 'string'
            ? row[column.name]
            : column.store?.length > 0
            ? column.store.find(item => item[column.valueField] === row[column.name])[column.displayField]
            : ''
          : ''

      default:
        return row[column.name]
    }
  }

  const cellEditor = (field, row, rowIndex, column) => {
    if (!row.rowData) return
    const fieldName = row.field
    const cellId = `table-cell-${rowIndex}-${column.id}` // Unique identifier for the cell

    const access = accessLevel({
      maxAccess: maxAccess,
      name: column.maxAccessName || column.name
    })

    const readOnly = access === DISABLED || (column.readOnly && access !== MANDATORY && access !== FORCE_ENABLED)

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
            readOnly={readOnly}
            disabled={readOnly}
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
      case 'datePicker':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              id={cellId}
              name={fieldName}
              value={formatDateFromApiInline(gridValidation.values.rows[rowIndex][fieldName])}
              required={column?.mandatory}
              readOnly={readOnly}
              disabled={readOnly}
              format={dateFormat}
              onChange={newDate => {
                if (newDate) {
                  const dateWithoutTime = new Date(newDate.valueOf())
                  dateWithoutTime.setHours(0, 0, 0, 0)
                  gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, formatDateDefault(dateWithoutTime))
                } else {
                  gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, '0')
                }
              }}
              onClose={() => setOpenDatePicker(false)}
              open={openDatePicker}
              clearable //bug from mui not working for now
              slotProps={{
                // replacing clearable behaviour
                textField: {
                  InputProps: {
                    endAdornment: (
                      <>
                        {gridValidation.values.rows[rowIndex][fieldName] && (
                          <InputAdornment>
                            <IconButton
                              onClick={() => gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, '0')}
                            >
                              <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                            </IconButton>
                          </InputAdornment>
                        )}
                        <InputAdornment>
                          <IconButton onClick={() => setOpenDatePicker(true)} sx={{ mr: -2 }}>
                            <EventIcon sx={{ border: '0px', fontSize: 20 }} />
                          </IconButton>
                        </InputAdornment>
                      </>
                    )
                  }
                }
              }}
            />
          </LocalizationProvider>
        )
      case 'numberfield':
        return (
          <TextField
            numberField={true}
            id={cellId}
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][fieldName]}
            required={column?.mandatory}
            onChange={newDate => {
              const newValue = event.target.value
              gridValidation.setFieldValue(
                `rows[${rowIndex}].${fieldName}`,
                handleNumberFieldNewValue(
                  newValue,
                  gridValidation.values.rows[rowIndex][fieldName],
                  column?.min,
                  column?.max
                )
              )
              if (newValue) row.editorCallback(newValue)
            }}
            onClear={() => {
              const updatedRows = [...gridValidation.values.rows]
              updatedRows[rowIndex][fieldName] = ''
              gridValidation.setFieldValue('rows', updatedRows)
            }}
            variant='outlined'
            size='small'
            fullWidth={true}
            inputProps={{
              readOnly: readOnly,
              disabled: readOnly,
              pattern: '[0-9]*',
              style: {
                textAlign: 'right'
              }
            }}
            autoComplete='off'
            style={{ textAlign: 'right' }}
            InputProps={{
              endAdornment:
                column.readOnly ||
                (gridValidation.values.rows[rowIndex][fieldName] != '0' &&
                  gridValidation.values.rows[rowIndex][fieldName] != 0 && (
                    <InputAdornment position='end'>
                      <IconButton
                        tabIndex={-1}
                        edge='end'
                        onClick={() => gridValidation.setFieldValue(`rows[${rowIndex}].${fieldName}`, 0)}
                        aria-label='clear input'
                      >
                        <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  ))
            }}
            helperText={
              gridValidation.errors?.rows &&
              gridValidation.errors?.rows[rowIndex] &&
              gridValidation.errors?.rows[rowIndex][fieldName]
            }
            error={
              gridValidation.errors?.rows &&
              gridValidation.errors?.rows[rowIndex] &&
              Boolean(gridValidation.errors?.rows[rowIndex][fieldName])
            }
          />
        )
      case 'combobox':
        return (
          <Autocomplete
            id={cellId}
            size='small'
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][`${column.nameId}`]}
            readOnly={readOnly}
            disabled={readOnly}
            options={column.store}
            getOptionLabel={option => {
              if (typeof option === 'object') {
                if (column.columnsInDropDown && column.columnsInDropDown.length > 0) {
                  let search = ''
                  {
                    column.columnsInDropDown.map((header, i) => {
                      search += `${option[header.key]} `
                    })
                  }

                  return search
                }

                return `${option[column.displayField]}`
              } else {
                const selectedOption = column.store.find(item => {
                  return item[column.valueField] === option
                })
                if (selectedOption) return selectedOption[column?.displayField]
                else return ''
              }
            }}
            
            // getOptionLabel={option => {
            //   if (typeof option === 'object') {
            //     if (column.columnsInDropDown && column.columnsInDropDown.length > 0) {
            //       let search = ''
            //       {
            //         column.columnsInDropDown.map((header, i) => {
            //           search += `${option[header.key]} `
            //         })
            //       }

            //       return search
            //     }

            //     return `${option[column.displayField]}`
            //   } else {
            //     const selectedOption = column.store.find(item => {
            //       return item[column.valueField] === option
            //     })
            //     if (selectedOption) return selectedOption[column?.displayField]
            //     else return ''
            //   }
            // }}
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
              if (newValue) row.editorCallback(newValue[column.valueField])
            }}
            PaperComponent={props =>
              column.columnsInDropDown &&
              column.columnsInDropDown.length > 0 &&
              CustomPaper(props, column.widthDropDown)
            }
            renderOption={(props, option) => {
              if (column.columnsInDropDown && column.columnsInDropDown.length > 0)
                return (
                  <Box>
                    {props.id.endsWith('-0') && (
                      <li className={props.className}>
                        {column.columnsInDropDown.map((header, i) => {
                          return (
                            <Box key={i} sx={{ flex: 1, fontWeight: 'bold' }}>
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
            openOnFocus
          />
        )
      case 'lookup':
        return (
          <Autocomplete
            id={cellId}
            size='small'
            name={fieldName}
            value={gridValidation.values.rows[rowIndex][`${column.name}`]}
            readOnly={readOnly}
            disabled={readOnly}
            options={column.store}
            getOptionLabel={option => (typeof option === 'object' ? `${option[column.displayField]}` : option)}
            open={write}
            renderOption={(props, option) => {
              if (column.columnsInDropDown && column.columnsInDropDown.length > 0)
                return (
                  <Box>
                    {props.id.endsWith('-0') && (
                      <li className={props.className}>
                        {column.columnsInDropDown.map((header, i) => {
                          return (
                            <Box key={i} sx={{ flex: 1, fontWeight: 'bold' }}>
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

            // onFocus={() => setOpen(true)}

            // getOptionLabel={option => {

            //   if (typeof option === 'object') return option[column.displayField]
            //   else {
            //     const selectedOption = column.store?.find(item => {
            //       return item[column.valueField] === option
            //     })
            //     if (selectedOption) return selectedOption[column?.displayField]
            //     else return ''
            //   }
            // }}
            isOptionEqualToValue={(option, value) => {
              return option[column.valueField] == gridValidation.values.rows[rowIndex][`${column.nameId}`]
            }}
            onChange={(event, newValue) => {
              event.stopPropagation()
              setWrite(false)
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
              CustomPaper(props, column.widthDropDown)
            }
            fullWidth={true}
            renderInput={params => (
              <TextField
                {...params}
                onChange={e =>
                  setWrite(
                    e.target.value.length > 0,
                    column.onLookup(''),
                    e.target.value
                      ? column && column.onLookup(e.target.value)
                      : column.onClear && column.onLookup('') && column.onClear()
                  )
                }
                onBlur={() => setWrite(false)}
                required={column?.mandatory}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        right: 15,
                        display: 'flex'
                      }}
                    >
                      {gridValidation.values.rows[rowIndex][`${column.nameId}`] && (
                        <InputAdornment position='end'>
                          <IconButton
                            tabIndex={-1}
                            edge='end'
                            onClick={() => {
                              gridValidation.setFieldValue(`rows[${rowIndex}].${column.nameId}`, null)
                              gridValidation.setFieldValue(`rows[${rowIndex}].${column.name}`, null)
                            }}
                            aria-label='clear input'
                          >
                            <ClearIcon sx={{ border: '0px', fontSize: 20 }} />
                          </IconButton>
                        </InputAdornment>
                      )}
                      <InputAdornment position='end'>
                        <IconButton tabIndex={-1} edge='end' aria-label='clear input'>
                          <SearchIcon
                            style={{ cursor: 'pointer' }}
                            sx={{ border: '0px', fontSize: 20 }}
                            onClick={() => {
                              // Handle search action if needed
                            }}
                          />
                        </IconButton>
                      </InputAdornment>

                      {/* Adjust color as needed */}
                      {/* {params.InputProps.startAdornment} */}
                    </div>
                  )
                }}
                sx={{ ...params.sx, flex: 1 }}
              />
            )}

            //  openOnFocus
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
              variant='rounded'
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

  const handleNumberFieldNewValue = (newValue, oldValue, min, max) => {
    const regex = /^[0-9,]+(\.\d+)?$/
    if (newValue && regex.test(newValue)) {
      const _newValue = getNumberWithoutCommas(newValue)
      if ((min && _newValue < min) || (max && _newValue > max)) return oldValue
      else return getFormattedNumber(newValue)
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
      <DataTable
        value={gridValidation?.values?.rows}
        scrollable={scrollable}
        scrollHeight={scrollHeight}
        editMode='cell'
        tableStyle={{ minWidth: tableWidth }}
        showGridlines
        stripedRows
        size='small'
      >
        {columns.map((column, i) => {
          const access = accessLevel({
            maxAccess,
            name: column.maxAccessName || column.name
          })

          return (
            <Column
              key={column.field}
              field={column.name}
              header={column.header}
              hidden={(column.hidden || access === HIDDEN) && access !== MANDATORY && access !== FORCE_ENABLED}
              style={{
                width: column.width || tableWidth / columns.length,
                background: background
              }}
              body={(row, rowIndex) => {
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
                    {cellRender(row, column)}

                    {/* {gridValidation.errors?.rows && gridValidation.errors?.rows[rowIndex.rowIndex] && !gridValidation.values?.rows[rowIndex.rowIndex][column.name] ? <Box sx={{fontSize:'13px' , p:1, color:'red'}}>{gridValidation.errors?.rows[rowIndex.rowIndex][column.name]}</Box>
                    : cellRender(row, column) } */}
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
              onCellEditComplete={e => {
                if (column.onChange) column.onChange(e)
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
                    <DeleteIcon sx={{ border: '0px', fontSize: 20 }} />
                  </IconButton>
                </div>
              )
            }}
            style={{ maxWidth: '60px', background: background }}
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
