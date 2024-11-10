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
  allowAddNewLine = true,
  onSelectionChange,
  bg
}) {
  const gridApiRef = useRef(null)

  const { stack } = useWindow()

  const [ready, setReady] = useState(false)

  const skip = allowDelete ? 1 : 0

  const process = (params, oldRow, setData) => {
    const column = columns.find(({ name }) => name === params.colDef.field)

    const updateRowCommit = changes => {
      setData(changes, params)
      commit({ changes: { ...params.node.data, changes } })
      // gridApiRef.current.redrawRows({ rowNodes: [changes.id] }) // replace `updatedData.id` with the correct ID
      gridApiRef.current.applyTransaction({ update: [{ ...params.node.data, changes }] })
    }

    if (column.onChange) {
      column.onChange({ row: { oldRow: oldRow, newRow: params.node.data, update: updateRowCommit } })
    }
  }

  function deleteRow(params) {
    const newRows = value.filter(({ id }) => id !== params.data.id)
    gridApiRef.current.applyTransaction({ remove: [params.data] })
    if (newRows?.length < 1) setReady(true)

    onChange(newRows)
  }

  function openDelete(params) {
    stack({
      Component: DeleteDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => deleteRow(params)
      },
      width: 450,
      height: 170,
      canExpand: false,
      title: 'Delete'
    })
  }

  useEffect(() => {
    if (!value?.length && allowAddNewLine && ready) {
      addNewRow()
      setReady(false)
    }
  }, [ready, value])

  const addNewRow = params => {
    const highestIndex = params?.node?.data?.id + 1 || 1

    const defaultValues = Object.fromEntries(
      columns.filter(({ name }) => name !== 'id').map(({ name, defaultValue }) => [name, defaultValue])
    )

    const newRow = {
      id: highestIndex,
      ...defaultValues
    }

    const res = gridApiRef.current?.applyTransaction({ add: [newRow] })
    if (res?.add?.length > 0) {
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

  const updateAndNewRow = params => {
    const { event, api } = params
    const allColumns = api.getColumnDefs()

    const column = allColumns.find(({ name }) => name === params.colDef.field)

    const addRow = async ({ changes }) => {
      console.log(params.rowIndex === value.length - 1, column.props?.jumpToNextLine)
      if (params.rowIndex === value.length - 1 && !changes) {
        console.log('changes', changes)
        addNewRow(params)
        return
      }
      const index = value.findIndex(({ id }) => id === changes.id)
      const row = value[index]
      const updatedRow = { ...row, ...changes }
      let rows

      gridApiRef.current.setRowData(value.map(row => (row.id === updatedRow?.id ? updatedRow : row)))

      if (params.rowIndex === value.length - 1 && column.props?.jumpToNextLine) {
        console.log('add')
        const highestIndex = value?.length
          ? value.reduce((max, current) => (max.id > current.id ? max : current)).id + 1
          : 1
        const defaultValues = Object.fromEntries(
          columns?.filter(({ name }) => name !== 'id').map(({ name, defaultValue }) => [name, defaultValue])
        )
        rows = [
          ...value.map(row => (row.id === updatedRow.id ? updatedRow : row)),
          {
            id: highestIndex,
            ...defaultValues
          }
        ]
        onChange(rows)
        setTimeout(() => {
          api.startEditingCell({
            rowIndex: index + 1,
            colKey: column?.field
          })
        }, 10)
      } else {
        rows = [...value.map(row => (row.id === updatedRow.id ? updatedRow : row))]
        const currentColumnIndex = allColumns?.findIndex(col => col.colId === params.column.getColId())
        onChange(rows)
        api.startEditingCell({
          rowIndex: index,
          colKey: allColumns[currentColumnIndex + 2].colId
        })
      }

      setTimeout(() => {
        api.startEditingCell({
          rowIndex: index + 1,
          colKey: column?.field
        })
      }, 10)
    }

    const updateRowCommit = changes => {
      setData(changes, params)
      commit({ changes: { ...params.node.data, changes } })
    }
    if (column.onCellPress)
      column.onCellPress(event, {
        row: { addRow: addRow, oldValue: value?.[params.rowIndex], update: updateRowCommit }
      })
  }

  const findCell = params => {
    const allColumns = params.api.getColumnDefs()

    if (gridApiRef.current) {
      return {
        rowIndex: params.rowIndex,
        columnIndex: allColumns?.findIndex(col => col.colId === params.column.getColId())
      }
    }
  }

  const onCellKeyDown = params => {
    const { column, event, api, node } = params

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

    const nextCell = findCell(params)

    const col = allColumns.find(({ name }) => name === params.colDef.field)
    if (col.onCellPress)
      if (event.key == 'Tab') {
        if (column.colDef.component === 'resourcelookup' && col.props.jumpToNextLine) {
          if (col.props.jumpToNextLine) {
            addNewRow(params)
          }
        } else {
          updateAndNewRow(params)
          return
        }
      }

    if (currentColumnIndex === allColumns.length - 1 - skip && node.rowIndex === api.getDisplayedRowCount() - 1) {
      if (allowAddNewLine && !error) {
        event.stopPropagation()
        addNewRow(params)
      }
    }

    const columns = gridApiRef.current.getColumnDefs()
    if (!event.shiftKey) {
      if (nextCell.columnIndex < columns.length - skip - 1) {
        nextCell.columnIndex += 1
      } else if (
        nextCell.columnIndex === columns.length - 1 - skip &&
        node.rowIndex !== api.getDisplayedRowCount() - 1
      ) {
        nextCell.rowIndex += 1
        nextCell.columnIndex = 0
      }
    } else if (nextCell.columnIndex > 0) {
      nextCell.columnIndex -= 1
    } else {
      nextCell.rowIndex -= 1
      nextCell.columnIndex = columns.length - 1 - skip
    }

    const field = columns[nextCell.columnIndex].field

    api.startEditingCell({
      rowIndex: nextCell.rowIndex,
      colKey: field
    })

    const row = params.data
    if (onSelectionChange) onSelectionChange(row)
  }

  const CustomCellRenderer = params => {
    const { column } = params

    const Component =
      typeof column.colDef.component === 'string'
        ? components[column.colDef.component].view
        : column.colDef.component.view

    async function update({ field, value }) {
      const oldRow = params.data

      const changes = {
        [field]: value || undefined
      }

      setData(changes, params)

      commit(changes)

      process(params, oldRow, setData)
    }

    const updateRow = ({ changes }) => {
      const oldRow = params.data

      setData(changes, params)

      commit(changes)

      process(params, oldRow, setData)
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          padding: '0 1000px',
          display: 'flex',
          justifyContent:
            (column.colDef.component === 'checkbox' ||
              column.colDef.component === 'button' ||
              column.colDef.component === 'icon') &&
            'center'
        }}
      >
        <Component {...params} column={column.colDef} updateRow={updateRow} update={update} />
      </Box>
    )
  }

  const CustomCellEditor = params => {
    const { column, data, maxAccess } = params

    const Component =
      typeof column?.colDef?.component === 'string'
        ? components[column?.colDef?.component]?.edit
        : column?.component?.edit

    const maxAccessName = `${name}.${column.colId}`

    const props = {
      ...column.colDef.props,
      name: maxAccessName,
      maxAccess
    }

    async function update({ field, value }) {
      const oldRow = params.data

      const changes = {
        [field]: value || undefined
      }

      setData(changes, params)

      console.log('column.colDef?.props?.jumpToNextLine', column.colDef?.props?.jumpToNextLine)
      if (column.colDef.updateOn !== 'blur' && !column.colDef?.props?.jumpToNextLine) {
        commit(changes)
        process(params, oldRow, setData)
      }
    }

    const updateRow = ({ changes }) => {
      const oldRow = params.data

      setData(changes, params)

      if (column.colDef.updateOn !== 'blur') {
        commit(changes)

        process(params, oldRow, setData)
      }
    }

    const comp = column.colDef.component

    console.log(gridApiRef.current.getRowNode(params.node.data.id).data)
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          padding: '0 0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: (comp === 'checkbox' || comp === 'button' || comp === 'icon') && 'center'
        }}
      >
        <Component
          id={params.node.data.id}
          {...params}
          value={gridApiRef.current.getRowNode(params.node.data.id).data}
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
        onClick={() => openDelete(params)}
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
      cellEditorParams: { maxAccess },
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

  const commit = data => {
    const allRowNodes = []
    gridApiRef.current.forEachNode(node => allRowNodes.push(node.data))
    const updatedGridData = allRowNodes.map(row => (row.id === data?.id ? data : row))

    onChange(updatedGridData)
  }

  const onCellClicked = params => {
    const { colDef, rowIndex, api } = params

    api.startEditingCell({
      rowIndex: rowIndex,
      colKey: colDef.field
    })
  }

  const gridContainerRef = useRef(null)

  useEffect(() => {
    function handleBlur(event) {
      if (gridContainerRef.current && !gridContainerRef.current.contains(event.target)) {
        gridApiRef.current?.stopEditing()
      }
    }

    const gridContainer = gridContainerRef.current

    if (gridContainer) {
      document.addEventListener('click', handleBlur)
    }

    return () => {
      if (gridContainer) {
        document.removeEventListener('click', handleBlur)
      }
    }
  }, [])

  useEffect(() => {
    function handleBlur(event) {
      if (
        gridContainerRef.current &&
        !event.target.value &&
        event.target.classList.contains('ag-center-cols-viewport')
      ) {
        gridApiRef.current?.stopEditing()
      }
    }

    const gridContainer = gridContainerRef.current

    if (gridContainer) {
      gridContainer.addEventListener('mousedown', handleBlur)
    }

    return () => {
      if (gridContainer) {
        gridContainer.removeEventListener('mousedown', handleBlur)
      }
    }
  }, [])

  function handleRowChange(row) {
    const newRows = [...value]
    const index = newRows.findIndex(({ id }) => id === row.id)
    newRows[index] = row
    onChange(newRows)

    return row
  }

  async function updateState({ newRow }) {
    gridApiRef.current.updateRows([newRow])

    handleRowChange(newRow)
  }

  const handleRowClick = params => {
    const selectedRow = params?.data
    if (onSelectionChange) {
      async function update({ newRow }) {
        updateState({
          newRow
        })
      }
      onSelectionChange(selectedRow, update)
    }
  }

  const setData = (changes, params) => {
    const id = params.node?.id

    const rowNode = params.api.getRowNode(id)
    if (rowNode) {
      const currentData = rowNode.data

      const newData = { ...currentData, ...changes }

      // rowNode.updateData(newData)
      gridApiRef.current.applyTransaction({ update: [newData] })
    }
  }

  const onCellEditingStopped = params => {
    const { data, colDef } = params

    if (colDef.updateOn === 'blur') {
      process(params, data, setData)
    }
  }

  return (
    <Box sx={{ height: height || 'auto', flex: 1 }}>
      <CacheDataProvider>
        <Box
          className='ag-theme-alpine'
          style={{ height: '100%', width: '100%' }}
          sx={{
            '.ag-header': {
              background: bg
            }
          }}
          ref={gridContainerRef}
        >
          {value && (
            <AgGridReact
              gridApiRef={gridApiRef}
              rowData={value}
              columnDefs={columnDefs}
              suppressRowClickSelection={false}
              stopEditingWhenCellsLoseFocus={false}
              rowSelection='single'
              editType='cell'
              singleClickEdit={false}
              onGridReady={params => {
                gridApiRef.current = params.api
                onChange(value)
                setReady(true)
              }}
              onCellKeyDown={onCellKeyDown}
              onCellClicked={onCellClicked}
              rowHeight={45}
              getRowId={params => params?.data?.id}
              tabToNextCell={() => true}
              tabToPreviousCell={() => true}
              onRowClicked={handleRowClick}
              onCellEditingStopped={onCellEditingStopped}
            />
          )}
        </Box>
      </CacheDataProvider>
    </Box>
  )
}
