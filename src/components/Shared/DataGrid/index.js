import {
  GridDeleteIcon,
  DataGrid as MUIDataGrid,
  gridExpandedSortedRowIdsSelector,
  useGridApiRef
} from '@mui/x-data-grid'
import components from './components'
import { Box, IconButton } from '@mui/material'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useError } from 'src/error'
import DeleteDialog from '../DeleteDialog'
import { HIDDEN, accessLevel } from 'src/services/api/maxAccess'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { CacheDataProvider } from 'src/providers/CacheDataContext'

export function DataGrid({
  idName = 'id',
  name,
  maxAccess,
  columns,
  value,
  error,
  bg,
  height,
  onChange,
  allowDelete = true,
  allowAddNewLine = true,
  onSelectionChange,
  rowSelectionModel,
  disabled = false
}) {
  async function processDependenciesForColumn(newRow, oldRow, editCell) {
    const column = columns.find(({ name }) => name === editCell.field)

    let updatedRow = { ...newRow }

    if (column.onChange)
      await column.onChange({
        row: {
          newRow,
          oldRow,
          update(updates) {
            updatedRow = { ...updatedRow, ...updates }
          }
        }
      })

    return updatedRow
  }

  const updateAndNewRow = async ({ fieldName, changes }) => {
    // const rowIds = gridExpandedSortedRowIdsSelector(apiRef.current.state)
    // console.log('rowIds', rowIds.length, changes.id)

    // if (rowIds.length === changes.id) {
    stageRowUpdate({
      changes
    })

    const changess = stagedChanges.current

    if (!changess) return apiRef.current.getRow(currentEditCell.current.id)

    const row = apiRef.current.getRow(currentEditCell.current.id)

    const updatedRow = await processDependenciesForColumn(
      {
        ...row,
        ...changess
      },
      row,
      {
        id: currentEditCell.current.id,
        field: currentEditCell.current.field
      }
    )

    apiRef.current.updateRows([updatedRow])

    const highestIndex = value?.length
      ? value.reduce((max, current) => (max[idName] > current[idName] ? max : current))[idName] + 1
      : 1

    const defaultValues = Object.fromEntries(
      columns?.filter(({ name }) => name !== idName).map(({ name, defaultValue }) => [name, defaultValue])
    )

    onChange([
      ...value.map(row => (row[idName] === updatedRow[idName] ? updatedRow : row)), // Update existing row
      {
        [idName]: highestIndex, // Add new row with unique id
        ...defaultValues
      }
    ])
    console.log('test')

    setNextEdit({
      id: changes.id + 1,
      field: fieldName
    })
    // }
  }

  function handleRowChange(row) {
    const newRows = [...value]
    const index = newRows.findIndex(({ id }) => id === row.id)
    newRows[index] = row
    onChange(newRows)

    return row
  }

  const apiRef = useGridApiRef()

  const [isUpdatingField, setIsUpdating] = useState(false)
  const { platformLabels } = useContext(ControlContext)

  const [nextEdit, setNextEdit] = useState(null)

  const skip = allowDelete ? 1 : 0

  useEffect(() => {
    if (!isUpdatingField && nextEdit) {
      const { id, field } = nextEdit
      if (!disabled) {
        if (id) {
          if (apiRef.current.getCellMode(id, field) === 'view') apiRef?.current.startCellEditMode({ id, field })
          apiRef.current.setCellFocus(id, field)
        }
      }
      setNextEdit(null)
    }
  }, [isUpdatingField, nextEdit])

  function findCell({ id, field }) {
    return {
      rowIndex: apiRef.current.getRowIndexRelativeToVisibleRows(id),
      columnIndex: apiRef.current.getColumnIndex(field)
    }
  }

  const Cols = columns

  const handleCellKeyDown = (params, event) => {
    if (event.key === 'Enter') {
      event.stopPropagation()

      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const rowIds = gridExpandedSortedRowIdsSelector(apiRef.current.state)
    const columns = apiRef.current.getVisibleColumns()

    const nextCell = findCell(params)

    const currentCell = { ...nextCell }

    if (nextCell.columnIndex === columns.length - 1 - skip && nextCell.rowIndex === rowIds.length - 1) {
      if (error || !allowAddNewLine) {
        event.stopPropagation()

        return
      }
    }
    if (apiRef.current.getCellMode(rowIds[currentCell.rowIndex], columns[currentCell.columnIndex].field) === 'edit')
      apiRef.current.stopCellEditMode({
        id: rowIds[nextCell.rowIndex],
        field: columns[nextCell.columnIndex].field
      })

    const column = Cols?.find(item => item.name == params.field)
    if (
      event.key == 'Tab' &&
      column?.props?.jumpToNextLine &&
      nextCell.rowIndex === rowIds.length - 1 &&
      !error &&
      allowAddNewLine
    ) {
      if (column.component === 'resourcelookup') {
        addRow()
      } else {
        return
      }
    }

    if (nextCell.columnIndex === columns.length - 1 - skip && nextCell.rowIndex === rowIds.length - 1) {
      addRow()
    }

    if (nextCell.columnIndex === columns.length - 1 && nextCell.rowIndex === rowIds.length - 1 && !event.shiftKey) {
      return
    }

    if (nextCell.columnIndex === 0 && nextCell.rowIndex === 0 && event.shiftKey) {
      return
    }

    event.preventDefault()
    event.defaultMuiPrevented = true
    console.log('nextCell.TEST')

    process.nextTick(() => {
      const rowIds = gridExpandedSortedRowIdsSelector(apiRef.current.state)
      const columns = apiRef.current.getVisibleColumns()

      // if (event.key == 'Tab' && column?.props?.jumpToNextLine && !error && allowAddNewLine) {
      //   nextCell.rowIndex += 1
      // } else {
      if (!event.shiftKey) {
        if (nextCell.columnIndex < columns.length - 1 - skip) {
          nextCell.columnIndex += 1
        } else {
          nextCell.rowIndex += 1
          nextCell.columnIndex = 0
        }
      } else if (nextCell.columnIndex > 0) {
        nextCell.columnIndex -= 1
      } else {
        nextCell.rowIndex -= 1
        nextCell.columnIndex = columns.length - 1
      }
      // }
      const field = columns[nextCell.columnIndex].field
      const id = rowIds[nextCell.rowIndex]

      setNextEdit({
        id,
        field
      })
      const row = apiRef.current.getRow(id)
      if (onSelectionChange) onSelectionChange(row)
    })
  }

  function addRow() {
    const highestIndex = value?.length
      ? value.reduce((max, current) => (max[idName] > current[idName] ? max : current))[idName] + 1
      : 1

    const defaultValues = Object.fromEntries(
      columns.filter(({ name }) => name !== idName).map(({ name, defaultValue }) => [name, defaultValue])
    )

    console.log('TESTTTTT', [
      ...value,
      {
        [idName]: highestIndex,
        ...defaultValues
      }
    ])

    onChange([
      ...value,
      {
        [idName]: highestIndex,
        ...defaultValues
      }
    ])
  }

  const addNewRow = id => {
    setTimeout(() => {
      addRow()

      setNextEdit({
        id: id + 1,
        field: 'sku'
      })
    }, 100)
  }

  useEffect(() => {
    if (!value?.length && allowAddNewLine) {
      addRow()
    }
  }, [value])

  function deleteRow(deleteId) {
    const newRows = value.filter(({ id }) => id !== deleteId)
    onChange(newRows)
  }

  const actionsColumn = {
    field: !allowDelete && 'actions',
    editable: false,
    flex: 0,
    width: '20',
    renderCell({ id: idName }) {
      return (
        <IconButton disabled={disabled} tabIndex='-1' icon='pi pi-trash' onClick={() => openDelete(idName)}>
          <GridDeleteIcon />
        </IconButton>
      )
    }
  }

  function openDelete(id) {
    stack({
      Component: DeleteDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => deleteRow(id)
      },
      width: 450,
      height: 170,
      canExpand: false,
      title: platformLabels.Delete
    })
  }

  const currentEditCell = useRef(null)

  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const stagedChanges = useRef(null)

  function stageRowUpdate({ changes }) {
    console.log('changes', changes)
    apiRef.current.setEditCellValue({
      id: currentEditCell.current.id,
      field: currentEditCell.current.field,
      value: changes?.[currentEditCell?.current?.field]
    })

    stagedChanges.current = changes
  }

  async function commitRowUpdate() {
    const changes = stagedChanges.current

    if (!changes) return apiRef.current.getRow(currentEditCell.current.id)

    const row = apiRef.current.getRow(currentEditCell.current.id)

    const updatedRow = await processDependenciesForColumn(
      {
        ...row,
        ...changes
      },
      row,
      {
        id: currentEditCell.current.id,
        field: currentEditCell.current.field
      }
    )

    apiRef.current.updateRows([updatedRow])

    handleRowChange(updatedRow)

    stagedChanges.current = null

    return updatedRow
  }

  async function updateState({ newRow }) {
    apiRef.current.updateRows([newRow])

    handleRowChange(newRow)
  }

  const handleRowClick = params => {
    const selectedRow = apiRef.current.getRow(params.id)
    if (onSelectionChange) {
      async function update({ newRow }) {
        updateState({
          newRow
        })
      }
      onSelectionChange(selectedRow, update)
    }
  }

  async function updateRowState({ id, changes }) {
    const row = apiRef.current.getRow(id)
    const newRow = { ...row, ...changes }
    apiRef.current.updateRows([newRow])
    handleRowChange(newRow)
  }

  return (
    <Box sx={{ height: height ? height : 'auto', flex: '1 !important' }}>
      {/* Container with scroll */}
      <CacheDataProvider>
        <MUIDataGrid
          hideFooter
          autoHeight={false}
          columnResizable={false}
          disableColumnFilter
          disableColumnMenu
          disableColumnSelector
          disableSelectionOnClick
          disableMultipleSelection
          getRowId={row => row[idName]}
          rowSelectionModel={[rowSelectionModel]}
          onCellClick={params => {
            const cellMode = apiRef.current.getCellMode(params.id, params.field)
            if (cellMode === 'view' && params.isEditable) {
              apiRef.current.startCellEditMode({ id: params.id, field: params.field })
              apiRef.current.setCellFocus(params.id, params.field)
            }
          }}
          onStateChange={state => {
            if (Object.entries(state.editRows)[0]) {
              const [id, obj] = Object.entries(state.editRows)[0]
              currentEditCell.current = { id, field: Object.keys(obj)[0] }
            }
          }}
          processRowUpdate={async () => {
            setIsUpdating(true)

            const row = await commitRowUpdate()

            setIsUpdating(false)

            return row
          }}
          onProcessRowUpdateError={e => {
            console.error(
              `[Datagrid - ERROR]: Error updating row with id ${currentEditCell.current.id} and field ${currentEditCell.current.field}.`
            )
            console.error('[Datagrid - ERROR]: Please handle all errors inside onChange of your respective field.')
            console.error('[Datagrid - ERROR]:', e)

            stackError({ message: 'Error occured while updating row.' })
          }}
          onCellKeyDown={handleCellKeyDown}
          columnVisibilityModel={{
            ...Object.fromEntries(
              columns
                .filter(({ name: fieldName }) => accessLevel({ maxAccess, name: `${name}.${fieldName}` }) === HIDDEN)
                .map(({ name }) => [name, false])
            ),
            actions: allowDelete
          }}
          rows={value}
          apiRef={apiRef}
          editMode='cell'
          sx={{
            display: 'flex !important',
            flex: '1 !important',
            '& .MuiDataGrid-cell': {
              padding: '0 !important'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: bg
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: '900'
            },
            '& .MuiDataGrid-virtualScroller': {
              zIndex: 0
            }
          }}
          onRowClick={handleRowClick} // Handle row click event
          columns={[
            ...columns.map(column => ({
              field: column.name,
              headerName: column.label || column.name,
              editable: !disabled,
              flex: column.flex || 1,
              sortable: false,
              renderCell(params) {
                const Component =
                  typeof column.component === 'string' ? components[column.component].view : column.component.view

                const cell = findCell(params)

                async function updateRow({ changes }) {
                  updateRowState({ id: params.row.id, changes })
                }

                async function update({ newRow }) {
                  updateState({
                    newRow
                  })
                }

                function handleCheckboxChange(event) {
                  const changes = { [params.field]: event.target.checked }
                  updateRow({ changes })
                  const column = columns.find(col => col.name === params.field)
                  if (column?.onChange) {
                    column.onChange({
                      row: {
                        update: changes => updateRow({ changes }),
                        newRow: { ...params.row, ...changes }
                      }
                    })
                  }
                }

                return (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      padding: '0 20px',
                      backgroundColor: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        (column.component === 'checkbox' ||
                          column.component === 'button' ||
                          column.component === 'icon') &&
                        'center',
                      border: `1px solid ${error?.[cell.rowIndex]?.[params.field] ? '#ff0000' : 'transparent'}`,
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                  >
                    {column.component === 'checkbox' ? (
                      <input type='checkbox' checked={!!params.value} onChange={handleCheckboxChange} />
                    ) : (
                      <Component {...params} update={update} updateRow={updateRow} column={column} />
                    )}
                  </Box>
                )
              },
              renderEditCell(params) {
                const columnId = column.name // Adjust according to your column definition

                const Component =
                  typeof column.component === 'string' ? components[column.component].edit : column.component.edit

                const maxAccessName = `${name}.${column.name}`

                const props = {
                  ...column.props,
                  name: maxAccessName,
                  maxAccess
                }

                async function update({ field, value }) {
                  stageRowUpdate({
                    changes: {
                      [field]: value
                    }
                  })

                  if (column.updateOn !== 'blur') await commitRowUpdate()
                }

                async function updateRow({ changes }) {
                  stageRowUpdate({
                    changes
                  })

                  if (column.updateOn !== 'blur') await commitRowUpdate()
                }
                const row = apiRef.current.getRow(params.id)

                return (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      padding: '0 0px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        (column.component === 'checkbox' ||
                          column.component === 'button' ||
                          column.component === 'icon') &&
                        'center'
                    }}
                  >
                    <Component
                      {...params}
                      column={{
                        ...column,
                        props: column.propsReducer ? column?.propsReducer({ row, props }) : props
                      }}
                      addRow={updateAndNewRow}
                      update={update}
                      updateRow={updateRow}
                      isLoading={isUpdatingField}
                    />
                  </Box>
                )
              }
            })),
            actionsColumn
          ]}
        />
      </CacheDataProvider>
    </Box>
  )
}
