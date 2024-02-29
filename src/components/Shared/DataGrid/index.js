import { GridDeleteIcon, DataGrid as MUIDataGrid, gridExpandedSortedRowIdsSelector, useGridApiRef } from '@mui/x-data-grid'
import components from './components'
import { Box, Button, IconButton } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useError } from 'src/error'

export function DataGrid({ idName = 'id', columns, value, error, bg, onChange }) {
  async function processDependencies(newRow, oldRow, editCell) {
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

  function handleChange(row) {
    const newRows = [...value]
    const index = newRows.findIndex(({ id }) => id === row.id)
    newRows[index] = row
    onChange(newRows)

    return row
  }

  const apiRef = useGridApiRef()

  const [isUpdatingField, setIsUpdating] = useState(false)

  const [nextEdit, setNextEdit] = useState(null)

  useEffect(() => {
    if (!isUpdatingField && nextEdit) {
      const { id, field } = nextEdit

      if (apiRef.current.getCellMode(id, field) === 'view') apiRef.current.startCellEditMode({ id, field })
      apiRef.current.setCellFocus(id, field)

      setNextEdit(null)
    }
  }, [isUpdatingField, nextEdit])

  function findCell({ id, field }) {
    return {
      rowIndex: apiRef.current.getRowIndexRelativeToVisibleRows(id),
      columnIndex: apiRef.current.getColumnIndex(field)
    }
  }

  const handleCellKeyDown = (params, event) => {
    if (event.key === 'Enter') {
      event.stopPropagation()

      return
    }

    if (event.key !== 'Tab') {
      return
    }
     console.log(params, event)
    const rowIds = gridExpandedSortedRowIdsSelector(apiRef.current.state)
    const visibleColumns = apiRef.current.getVisibleColumns()

    const nextCell = findCell(params)

    const currentCell = { ...nextCell }


    if (
      apiRef.current.getCellMode(rowIds[currentCell.rowIndex], visibleColumns[currentCell.columnIndex].field) === 'edit'
    )
      apiRef.current.stopCellEditMode({
        id: rowIds[nextCell.rowIndex],
        field: visibleColumns[nextCell.columnIndex].field
      })

    if (nextCell.columnIndex === visibleColumns.length - 2 && nextCell.rowIndex === rowIds.length - 1) {
      if(!error){
      addRow()
     }else{
      return;
     }

    }



    if (
      nextCell.columnIndex === visibleColumns.length - 1 &&
      nextCell.rowIndex === rowIds.length - 1 &&
      !event.shiftKey
    ) {
      return
    }

    if (nextCell.columnIndex === 0 && nextCell.rowIndex === 0 && event.shiftKey) {
      return
    }

    event.preventDefault()
    event.defaultMuiPrevented = true

    process.nextTick(() => {
      const rowIds = gridExpandedSortedRowIdsSelector(apiRef.current.state)
      const visibleColumns = apiRef.current.getVisibleColumns()

      if (!event.shiftKey) {
        if (nextCell.columnIndex < visibleColumns.length - 2) {
          nextCell.columnIndex += 1
        } else {
          nextCell.rowIndex += 1
          nextCell.columnIndex = 0
        }
      } else if (nextCell.columnIndex > 0) {
        nextCell.columnIndex -= 1
      } else {
        nextCell.rowIndex -= 1
        nextCell.columnIndex = visibleColumns.length - 1
      }

      const field = visibleColumns[nextCell.columnIndex].field
      const id = rowIds[nextCell.rowIndex]

      setNextEdit({
        id,
        field
      })
    })
  }

  function addRow() {
    const highestIndex = value.reduce((max, current) => (max[idName] > current[idName]? max : current))[idName] + 1


    const defaultValues = Object.fromEntries(
      columns.filter(({ name }) => name !== idName).map(({ name, defaultValue }) => [name, defaultValue])
    )


        onChange([
          ...value,
          {
            [idName]: highestIndex,
            ...defaultValues
          }
        ])

  }

  function deleteRow(deleteId) {
    const newRows = value.filter(({ id }) => id !== deleteId)

    onChange(newRows)
  }

  const actionsColumn = {
    field: 'actions',
    editable: false,
    width: '100',
    renderCell({ id }) {
      return (
          <IconButton tabIndex='-1' icon='pi pi-trash' onClick={() => deleteRow(id)}>
            <GridDeleteIcon />
          </IconButton>
      )
    }
  }

  const currentEditCell = useRef(null)

  const { stack } = useError()

  return (
    <MUIDataGrid
      hideFooter
      autoHeight
      disableColumnFilter
      disableColumnMenu
      disableColumnSelector
      disableSelectionOnClick
      getRowId={(row) => row[idName]}
      onStateChange={state => {
        if (Object.entries(state.editRows)[0]) {
          const [id, obj] = Object.entries(state.editRows)[0]
          currentEditCell.current = { id, field: Object.keys(obj)[0] }
        }
      }}
      processRowUpdate={async (newRow, oldRow) => {
        setIsUpdating(true)
        const updated = await processDependencies(newRow, oldRow, currentEditCell.current)

        const change = handleChange(updated, oldRow)

        setIsUpdating(false)

        return change
      }}
      onProcessRowUpdateError={e => {
        console.error(
          `[Datagrid - ERROR]: Error updating row with id ${currentEditCell.current.id} and field ${currentEditCell.current.field}.`
        )
        console.error('[Datagrid - ERROR]: Please handle all errors inside onChange of your respective field.')
        console.error('[Datagrid - ERROR]:', e)
        stack({ message: 'Error occured while updating row.' })
      }}
      onCellKeyDown={handleCellKeyDown}
      rows={value}
      apiRef={apiRef}
      editMode='cell'
      sx={{
        '& .MuiDataGrid-cell': {
          padding: '0 !important'
        }
      }}
      columns={[
        ...columns.map(column => ({
          field: column.name,
          headerName: column.label || column.name,
          editable: true,
          width: column.width || 170,
          sortable: false,
          renderCell(params) {
            const Component =
              typeof column.component === 'string' ? components[column.component].view : column.component.view

            const cell = findCell(params)

            return (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  padding: '0 20px',
                   backgroundColor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${error?.[cell.rowIndex]?.[params.field] ? '#ff0000' : 'transparent'}`

                }}
              >
                <Component {...params} column={column} />
              </Box>
            )
          },
          renderEditCell(params) {
            const Component =
              typeof column.component === 'string' ? components[column.component].edit : column.component.edit

            return (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  padding: '0 0px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Component {...params} column={column} isLoading={isUpdatingField} />
              </Box>
            )
          }
        })),
        actionsColumn
      ]}
    />
  )
}
