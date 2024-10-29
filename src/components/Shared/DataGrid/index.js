import React, { useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, IconButton } from '@mui/material'
import components from './components'
import { CacheDataProvider } from 'src/providers/CacheDataContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { GridDeleteIcon } from '@mui/x-data-grid'
import { HIDDEN, accessLevel } from 'src/services/api/maxAccess'
import { useWindow } from 'src/windows'
import DeleteDialog from '../DeleteDialog'
import nextAppLoader from 'next/dist/build/webpack/loaders/next-app-loader'

export function DataGrid({
  name, // maxAccess
  columns,
  value,
  error,
  maxAccess,
  height,
  onChange,
  disabled = false,
  allowDelete = true,
  allowAddNewLine = true
}) {
  const gridApiRef = useRef(null)

  const { stack } = useWindow()

  const skip = allowDelete ? 1 : 0

  const process = (params, oldRow, setData) => {
    const column = columns.find(({ name }) => name === params.colDef.field)

    const updateRowCommit = changes => {
      setData(changes)
      commit(changes)
    }

    if (column.onChange) {
      column.onChange({ row: { oldRow: oldRow, newRow: params.node.data, update: updateRowCommit } })
    }
  }

  function deleteRow(deleteId) {
    const newRows = value.filter(({ id }) => id !== deleteId)
    onChange(newRows)
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
      title: 'Delete'
    })
  }

  // useEffect(() => {
  //   if (!value?.length && allowAddNewLine) {
  //     addNewRow()
  //   }
  // }, [value])

  const addNewRow = params => {
    const highestIndex = params.node.data.id + 1

    const defaultValues = Object.fromEntries(
      columns.filter(({ name }) => name !== 'id').map(({ name, defaultValue }) => [name, defaultValue])
    )

    const newRow = {
      id: highestIndex,
      ...defaultValues
    }

    const res = gridApiRef.current.applyTransaction({ add: [newRow] })

    if (res.add.length > 0) {
      const newRowNode = res.add[0]
      commit(newRowNode.data)

      setTimeout(() => {
        const rowNode = gridApiRef.current.getRowNode(newRowNode.data.id)

        if (rowNode) {
          const rowIndex = rowNode.rowIndex
          gridApiRef.current.startEditingCell({
            rowIndex: rowIndex,
            colKey: columns[0].name
          })
        }
      }, 0)
    }
  }

  const findCell = params => {
    console.log(params, params.column.getColId())
    const allColumns = params.api.getColumnDefs()

    if (gridApiRef.current) {
      return {
        rowIndex: params.rowIndex,
        columnIndex: allColumns?.findIndex(col => col.colId === params.column.getColId())
      }
    }
  }

  const getAllRows = () => {
    const allRows = []
    gridApiRef.current.forEachNode(node => {
      allRows.push(node.data) // Push the row data into the array
    })
    console.log('All Rows:', allRows)
    return allRows // You can return this array for further use
  }

  const onCellKeyDown = params => {
    const { event, api, node } = params

    const allColumns = api.getColumnDefs()
    const currentColumnIndex = allColumns?.findIndex(col => col.colId === params.column.getColId())

    if (event.key === 'Enter') {
      const nextColumnId = allColumns[currentColumnIndex].colId
      api.startEditingCell({
        rowIndex: node.rowIndex,
        colKey: nextColumnId
      })

      return
    }

    if (event.key !== 'Tab') {
      return
    }
    // params.api.stopEditing()

    const nextCell = findCell(params)

    console.log('nextCell', nextCell)
    const rowIds = getAllRows()

    if (currentColumnIndex === allColumns.length - 1 - skip && node.rowIndex === api.getDisplayedRowCount() - 1) {
      if (allowAddNewLine && !error) {
        event.stopPropagation()
        addNewRow(params)
      } else {
        // api.startEditingCell({
        //   rowIndex: node.rowIndex,
        //   colKey: allColumns[currentColumnIndex].colId
        // })
      }
    } else {
      const currentRowIndex = node.rowIndex

      if (currentColumnIndex < allColumns.length - 2 && event.key === 'Tab' && !event.shiftKey) {
        const nextColumnId = allColumns[currentColumnIndex + 1].colId

        // api.startEditingCell({
        //   rowIndex: currentRowIndex,
        //   colKey: nextColumnId
        // })
      } else {
        // const nextColumnId = allColumns[0].colId
        // api.startEditingCell({
        //   rowIndex: currentRowIndex + 1,
        //   colKey: nextColumnId
        // })
      }
    }
    // if (nextCell.columnIndex === allColumns.length - 1 && nextCell.rowIndex === rowIds.length - 1 && !event.shiftKey) {
    //   api.startEditingCell({
    //     rowIndex: currentRowIndex,
    //     colKey: allColumns[currentColumnIndex].colId
    //   })

    //   return
    // }

    // if (nextCell.columnIndex === 0 && nextCell.rowIndex === 0 && event.shiftKey) {
    //   return
    // }

    const columns = gridApiRef.current.getColumnDefs()
    // const rows = getAllRows
    if (!event.shiftKey) {
      if (currentColumnIndex < allColumns.length - skip) {
        nextCell.columnIndex += 1
      } else if (currentColumnIndex === allColumns.length - skip && node.rowIndex !== api.getDisplayedRowCount() - 1) {
        console.log('yessss')
        nextCell.rowIndex += 1
        nextCell.columnIndex = 0
      }
    } else if (nextCell.columnIndex > 0) {
      nextCell.columnIndex -= 1
      console.log('omar-2', -1)
    } else {
      nextCell.rowIndex -= 1
      nextCell.columnIndex = columns.length - 1 - skip

      console.log('omar-3', 1)
    }

    const field = columns[nextCell.columnIndex].field

    api.startEditingCell({
      rowIndex: nextCell.rowIndex,
      colKey: field
    })
  }

  const CustomCellRenderer = params => {
    const { column } = params

    const Component =
      typeof column.colDef.component === 'string'
        ? components[column.colDef.component].view
        : column.colDef.component.view

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          padding: '0 1000px',
          display: 'flex'
        }}
      >
        <Component {...params} column={column} />
      </Box>
    )
  }

  const CustomCellEditor = params => {
    const { column, data, maxAccess } = params
    const [currentValue, setCurrentValue] = useState(params?.node?.data?.[params?.colDef?.field] || '') // Capture current data state

    const Component =
      typeof column?.colDef?.component === 'string'
        ? components[column?.colDef?.component]?.edit
        : column?.component?.edit

    const maxAccessName = `${params.node.id}.${column.name}`

    const props = {
      ...column.colDef.props,
      name: maxAccessName,
      maxAccess
    }

    const setData = changes => {
      const id = params.node?.id
      const rowNode = params.api.getRowNode(id)
      if (rowNode) {
        const currentData = rowNode.data

        const newData = { ...currentData, ...changes }

        rowNode.updateData(newData)
      }
    }

    async function update({ field, value }) {
      const oldRow = params.data

      const changes = {
        [field]: value || ''
      }

      setCurrentValue(value || '')

      setData(changes)

      commit(changes)

      process(params, oldRow, setData)
    }

    const updateRow = ({ changes }) => {
      const oldRow = params.data

      setData(changes)

      commit(changes)

      process(params, oldRow, setData)

      params.api.stopEditing()
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          padding: '0 0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            (column.component === 'checkbox' || column.component === 'button' || column.component === 'icon') &&
            'center'
        }}
      >
        <Component
          id={params.node.data.id}
          field={params.colDef.field}
          {...params}
          value={currentValue}
          column={{
            ...column.colDef,
            props: column.propsReducer ? column?.propsReducer({ data, props }) : props
          }}
          updateRow={updateRow}
          update={update}
        />
      </Box>
    )
  }

  const getCellStyle = params => {
    const hasError = error && error[params.node.rowIndex]?.[params.colDef.field]

    return {
      border: hasError ? '1px solid #ff0000' : '1px solid transparent'
    }
  }

  const ActionCellRenderer = params => {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}
        onClick={() => openDelete(params.data.id)}
      >
        <IconButton>
          <GridDeleteIcon />
        </IconButton>
      </Box>
    )
  }

  const columnDefs = [
    ...columns.map(column => ({
      ...column,
      field: column.name,
      headerName: column.label || column.name,
      editable: !disabled,
      flex: column.flex || 1,
      sortable: false,
      cellRenderer: CustomCellRenderer,
      cellEditor: CustomCellEditor,
      cellStyle: getCellStyle,
      suppressKeyboardEvent: params => {
        const { event } = params

        return event.code === 'ArrowDown' || event.code === 'ArrowUp' || event.code === 'Enter' ? true : false
      }
    })),
    allowDelete
      ? {
          field: 'actions',
          headerName: '',
          width: 50,
          editable: false,
          sortable: false,
          cellRenderer: ActionCellRenderer
        }
      : null
  ]
    .filter(Boolean)
    .filter(({ name: field }) => accessLevel({ maxAccess, name: `${name}.${field}` }) !== HIDDEN)

  const onCellEditingStopped = params => {
    const { data } = params

    gridApiRef.current.applyTransaction({ update: [data] })

    // commit(data)
  }

  const commit = data => {
    const allRowNodes = []
    gridApiRef.current.forEachNode(node => allRowNodes.push(node.data))
    const updatedGridData = allRowNodes.map(row => (row.id === data?.id ? data : row))

    onChange(updatedGridData)
  }

  return (
    <Box sx={{ height: height || 'auto', flex: 1 }}>
      <CacheDataProvider>
        <div className='ag-theme-alpine' style={{ height: '100%', width: '100%' }}>
          {value && (
            <AgGridReact
              gridApiRef={gridApiRef}
              rowData={value}
              columnDefs={columnDefs}
              suppressRowClickSelection={false}
              stopEditingWhenCellsLoseFocus={true}
              rowSelection='single'
              editType='cell'
              singleClickEdit={true}
              onGridReady={params => {
                gridApiRef.current = params.api
                onChange(value)
              }}
              onCellKeyDown={onCellKeyDown}
              rowHeight={45}
              onCellEditingStopped={onCellEditingStopped}
              getRowId={params => params?.data?.id}
              tabToNextCell={() => true}
              tabToPreviousCell={() => true}
            />
          )}
        </div>
      </CacheDataProvider>
    </Box>
  )
}
