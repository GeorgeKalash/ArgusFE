import { DataGrid as MUIDataGrid, gridExpandedSortedRowIdsSelector, useGridApiRef } from '@mui/x-data-grid'
import components from './components'
import { Box, Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

export function DataGrid({ columns, value, error, onChange }) {
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

  const [updating, setIsUpdating] = useState(false)

  const [nextEdit, setNextEdit] = useState(null)

  useEffect(() => {
    if (!updating && nextEdit) {
      const { id, field } = nextEdit

      if (apiRef.current.getCellMode(id, field) === 'view') apiRef.current.startCellEditMode({ id, field })
      apiRef.current.setCellFocus(id, field)

      setNextEdit(null)
    }
  }, [updating, nextEdit])

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
      addRow()
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
    const highestIndex = value.reduce((max, current) => (max.id > current.id ? max : current))?.id + 1

    const defaultValues = Object.fromEntries(
      columns.filter(({ name }) => name !== 'id').map(({ name, defaultValue }) => [name, defaultValue])
    )

    onChange([
      ...value,
      {
        id: highestIndex,
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
        <>
          <Button onClick={() => deleteRow(id)}>Delete</Button>
        </>
      )
    }
  }

  const currentEditCell = useRef(null)

  return (
    <MUIDataGrid
      hideFooter
      autoHeight
      disableColumnFilter
      disableColumnMenu
      disableColumnSelector
      disableSelectionOnClick
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
                  backgroundColor: error?.[cell.rowIndex]?.[params.field] ? '#ff000050' : 'none',
                  display: 'flex',
                  alignItems: 'center'
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
                  padding: '0 20px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Component {...params} column={column} />
              </Box>
            )
          }
        })),
        actionsColumn
      ]}
    />
  )
}
