import { DataGrid as MUIDataGrid, gridExpandedSortedRowIdsSelector, useGridApiRef } from '@mui/x-data-grid'
import components from './components'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'

export function FormDataGrid({ columns, value, onChange }) {
  async function processDependencies(newRow, oldRow) {
    const changed = columns.filter(({ name }) => newRow[name] !== oldRow[name])

    let updatedRow = { ...newRow }

    for (const change of changed)
      if (change.onChange)
        await change.onChange({
          row: {
            values: newRow,
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

  const [updating, setUpdate] = useState(false)

  const [nextEdit, setNextEdit] = useState(null)

  useEffect(() => {
    if (!updating && nextEdit) {
      const { id, field } = nextEdit
      apiRef.current.startCellEditMode({ id, field })
      setNextEdit(null)
    }
  }, [updating, nextEdit])

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

    const nextCell = {
      rowIndex: rowIds.findIndex(id => id === params.id),
      columnIndex: apiRef.current.getColumnIndex(params.field)
    }

    const currentCell = { ...nextCell }

    if (
      apiRef.current.getCellMode(rowIds[currentCell.rowIndex], visibleColumns[currentCell.columnIndex].field) === 'edit'
    )
      apiRef.current.stopCellEditMode({
        id: rowIds[nextCell.rowIndex],
        field: visibleColumns[nextCell.columnIndex].field
      })

    if (nextCell.columnIndex === visibleColumns.length - 2) {
      addRowAt(nextCell.rowIndex + 1)
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

      apiRef.current.scrollToIndexes({ colIndex: nextCell.columnIndex, rowIndex: nextCell.columnIndex })

      if (apiRef.current.getColumn(field).editable) {
        setNextEdit({
          id,
          field
        })
      }

      apiRef.current.setCellFocus(id, field)
    })
  }

  function addRowAt(addId) {
    const highestIndex = value.reduce((max, current) => (max.id > current.id ? max : current))?.id + 1

    const indexOfId = value.findIndex(({ id }) => id === addId)

    const newRows = [...value]

    newRows.splice(indexOfId + 1, 0, {
      id: highestIndex
    })

    onChange(newRows)
  }

  function deleteRow(deleteId) {
    const newRows = value.filter(({ id }) => id !== deleteId)

    onChange(newRows)
  }

  const actionsColumn = {
    field: 'actions',
    editable: false,
    width: '400',
    renderCell({ id }) {
      return (
        <>
          <Button onClick={() => deleteRow(id)}>Delete</Button>
        </>
      )
    }
  }

  return (
    <>
      <MUIDataGrid
        processRowUpdate={async (newRow, oldRow) => {
          setUpdate(true)
          const updated = await processDependencies(newRow, oldRow)

          const change = handleChange(updated, oldRow)

          setUpdate(false)

          return change
        }}
        onCellKeyDown={handleCellKeyDown}
        rows={value}
        apiRef={apiRef}
        editMode='cell'
        columns={[
          ...columns.map(column => ({
            field: column.name,
            editable: column.editable ?? true,
            width: column.width || 200,
            sortable: false,
            renderCell(params) {
              const Component =
                typeof column.component === 'string' ? components[column.component].view : column.component.view

              return <Component {...params} column={column} />
            },
            renderEditCell(params) {
              const Component =
                typeof column.component === 'string' ? components[column.component].edit : column.component.edit

              return <Component {...params} column={column} />
            }
          })),
          actionsColumn
        ]}
      />
    </>
  )
}
