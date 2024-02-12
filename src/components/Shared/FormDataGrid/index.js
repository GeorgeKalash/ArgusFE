import { DataGrid as MUIDataGrid, gridExpandedSortedRowIdsSelector, useGridApiRef } from '@mui/x-data-grid'
import components from './components'
import { Button } from '@mui/material'

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

    if (!event.shiftKey) {
      if (nextCell.columnIndex < visibleColumns.length - 1) {
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

    if (apiRef.current.getColumn(field).editable) apiRef.current.startCellEditMode({ id, field })
    else apiRef.current.scrollToIndexes({ colIndex: nextCell.columnIndex, rowIndex: nextCell.columnIndex })

    apiRef.current.setCellFocus(id, field)
  }

  function addRow() {
    console.log(value)
    onChange([
      ...value,
      {
        id: 2
      }
    ])
  }

  const actionsColumn = {
    field: 'actions',
    editable: false,
    width: '400',
    renderCell() {
      return (
        <>
          <Button onClick={addRow}>Add</Button>
          <Button>Delete</Button>
        </>
      )
    }
  }

  return (
    <>
      <MUIDataGrid
        processRowUpdate={async (newRow, oldRow) => {
          const updated = await processDependencies(newRow, oldRow)

          return handleChange(updated, oldRow)
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
