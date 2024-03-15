import { GridDeleteIcon, DataGrid as MUIDataGrid, gridExpandedSortedRowIdsSelector, useGridApiRef } from '@mui/x-data-grid'
import components from './components'
import { Box, Button, IconButton } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useError } from 'src/error'
import DeleteDialog from '../DeleteDialog'

export function DataGrid({ idName = 'id', columns, value, error, bg, height, onChange ,  allowDelete=true, allowAddNewLine=true, disabled=false}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState([false, {}])


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
    const rowIds = gridExpandedSortedRowIdsSelector(apiRef.current.state)
    const columns = apiRef.current.getAllColumns()

    const nextCell = findCell(params)

    const currentCell = { ...nextCell }


    if ((nextCell.columnIndex === columns.length - 2 && nextCell.rowIndex === rowIds.length - 1)) {
      if (error || !allowAddNewLine){
      event.stopPropagation()

      return
      }

    }
    if (
      apiRef.current.getCellMode(rowIds[currentCell.rowIndex], columns[currentCell.columnIndex].field) === 'edit'
    )
      apiRef.current.stopCellEditMode({
        id: rowIds[nextCell.rowIndex],
        field: columns[nextCell.columnIndex].field
      })

    if (nextCell.columnIndex === columns.length - 2 && nextCell.rowIndex === rowIds.length - 1) {

      addRow()

    }

    if (
      nextCell.columnIndex === columns.length - 1 &&
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
      const columns = apiRef.current.getAllColumns()

      if (!event.shiftKey) {
        if (nextCell.columnIndex < columns.length - 2) {
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

      const field = columns[nextCell.columnIndex].field
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
    flex: 0,
    width: '100',
    renderCell({ id }) {
      return (
          <IconButton disabled={disabled} tabIndex='-1' icon='pi pi-trash' onClick={() => setDeleteDialogOpen([true,  id])}>
            <GridDeleteIcon />
          </IconButton>
      )
    }
  }

  const currentEditCell = useRef(null)

  const { stack } = useError()


  async function update({ id, field, value }) {
    const row = apiRef.current.getRow(id)

    apiRef.current.setEditCellValue({
      id,
      field,
      value
    })

    const updatedRow = await processDependencies(
      {
        ...row,
        [field]: value
      },
      row,
      {
        id,
        field
      }
    )

    apiRef.current.updateRows([updatedRow])

    handleChange(updatedRow, row)
  }

return (
    <Box sx={{ height: height ? height : 'auto', width: '100%', overflow: 'auto' }}> {/* Container with scroll */}

    <MUIDataGrid
      hideFooter
      autoHeight={height ? false : true}
      columnResizable={false}

      // autoWidth
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
      columnVisibilityModel= {{
        actions: allowDelete
      }}
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
          editable: !disabled,
          flex: column.flex || 1,

          // width: column.width || 170,
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
                <Component {...params} column={column} update={update} isLoading={isUpdatingField} />
              </Box>
            )
          }
        })),
       actionsColumn
      ]}
    />
    <DeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen([false, {}])}
            onConfirm={obj => {
              setDeleteDialogOpen([false, {}])
              deleteRow(obj)
            }}
          />
    </Box>
  )
}
