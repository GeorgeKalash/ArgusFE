import React, { useContext, useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, IconButton } from '@mui/material'
import components from './components'
import { CacheDataProvider } from 'src/providers/CacheDataContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { GridDeleteIcon } from '@mui/x-data-grid'
import { DISABLED, HIDDEN, accessLevel } from 'src/services/api/maxAccess'
import { useWindow } from 'src/windows'
import DeleteDialog from '../DeleteDialog'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { ControlContext } from 'src/providers/ControlContext'

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

  const isDup = useRef(null)

  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const [ready, setReady] = useState(false)

  const skip = allowDelete ? 1 : 0

  function checkDuplicates(field, data) {
    return value.find(
      item => item.id != data.id && item?.[field] && item?.[field]?.toLowerCase() === data?.[field]?.toLowerCase()
    )
  }

  function stackDuplicate(params) {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: platformLabels?.duplicateItem,
        okButtonAction: window => {
          deleteRow(params), window.close()
        },
        fullScreen: false
      },
      onClose: () => deleteRow(params),
      width: 450,
      height: 150,
      title: platformLabels.Confirmation
    })
  }

  const process = (params, oldRow, setData) => {
    const column = columns.find(({ name }) => name === params.colDef.field)

    if (params.colDef?.disableDuplicate && checkDuplicates(params.colDef.field, params.data)) {
      return
    }

    const updateCommit = changes => {
      setData(changes, params)
      commit({ changes: { ...params.node.data, changes } })
    }

    const updateRowCommit = changes => {
      const rowToUpdate = value?.find(item => item?.id === changes?.id)

      const updatedRow = { ...rowToUpdate, ...changes.changes }

      gridApiRef.current.applyTransaction({
        update: [updatedRow]
      })

      commit({ changes: updatedRow })
    }

    const addRow = async ({ changes }) => {
      if (params.rowIndex === value.length - 1 && !changes) {
        addNewRow(params)

        return
      }

      const index = value.findIndex(({ id }) => id === changes.id)
      const row = value[index]
      const updatedRow = { ...row, ...changes }
      let rows

      gridApiRef.current.setRowData(value.map(row => (row.id === updatedRow?.id ? updatedRow : row)))

      if (params.rowIndex === value.length - 1 && column.jumpToNextLine) {
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
          params.api.startEditingCell({
            rowIndex: index + 1,
            colKey: column?.name
          })
        }, 10)
      } else {
        rows = [...value.map(row => (row.id === updatedRow.id ? updatedRow : row))]
        const currentColumnIndex = allColumns?.findIndex(col => col.colId === params.column.getColId())
        onChange(rows)
        params.api.startEditingCell({
          rowIndex: index,
          colKey: allColumns[currentColumnIndex + 2].colId
        })
      }
    }

    if (column.onChange) {
      column.onChange({
        row: {
          oldRow: value[params.rowIndex],
          newRow: params.node.data,
          update: updateCommit,
          updateRow: updateRowCommit,
          addRow:
            params.rowIndex === value.length - 1 && !column.updateOn
              ? column.jumpToNextLine
                ? addNewRow
                : () => {}
              : addRow
        }
      })
    }
  }

  function deleteRow(params) {
    const newRows = value.filter(({ id }) => id !== params.data.id)
    gridApiRef.current.applyTransaction({ remove: [params.data] })
    if (newRows?.length < 1) setReady(true)

    onChange(newRows, 'delete')
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

  const addNewRow = () => {
    const highestIndex = Math.max(...value?.map(item => item.id), 0) + 1

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

  const findCell = params => {
    const allColumns = params.api.getColumnDefs()

    if (gridApiRef.current) {
      return {
        rowIndex: params.rowIndex,
        columnIndex: allColumns?.findIndex(col => col.colId === params.column.getColId())
      }
    }
  }

  const allColumns = columns.filter(
    ({ name: fieldName }) => accessLevel({ maxAccess, name: `${name}.${fieldName}` }) !== HIDDEN
  )

  const findNextEditableColumn = (columnIndex, rowIndex, direction) => {
    const limit = direction > 0 ? allColumns.length : -1
    const step = direction > 0 ? 1 : -1
    for (let i = columnIndex + step; i !== limit; i += step) {
      if (
        !allColumns?.[i]?.props?.readOnly &&
        accessLevel({ maxAccess, name: `${name}.${allColumns?.[i]?.name}` }) !== DISABLED
      ) {
        return { columnIndex: i, rowIndex }
      }
    }

    for (let i = direction > 0 ? 0 : allColumns.length - 1; i !== limit; i += step) {
      if (
        !allColumns?.[i]?.props?.readOnly &&
        accessLevel({ maxAccess, name: `${name}.${allColumns?.[i]?.name}` }) !== DISABLED
      ) {
        return {
          columnIndex: i,
          rowIndex: rowIndex + direction
        }
      }
    }
  }

  const nextColumn = columnIndex => {
    let count = 0
    for (let i = columnIndex + 1; i < allColumns.length; i++) {
      if (!allColumns?.[i]?.props?.readOnly) {
        count++
      }
    }

    return count
  }

  const onCellKeyDown = params => {
    const { event, api, node, data, colDef } = params

    if (colDef?.disableDuplicate && checkDuplicates(colDef?.field, data) && event.key !== 'Enter') {
      isDup.current = true

      return
    } else {
      isDup.current = false
    }

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

    if (currentColumnIndex === allColumns.length - 1 - skip && node.rowIndex === api.getDisplayedRowCount() - 1) {
      if ((error || !allowAddNewLine) && !event.shiftKey) {
        event.stopPropagation()

        return
      }
    }

    const countColumn = nextColumn(nextCell.columnIndex)

    if (
      (currentColumnIndex === allColumns.length - 1 - skip || !countColumn) &&
      node.rowIndex === api.getDisplayedRowCount() - 1
    ) {
      if (allowAddNewLine && !error) {
        event.stopPropagation()
        addNewRow(params)
      }
    }

    const columns = gridApiRef.current.getColumnDefs()
    if (!event.shiftKey) {
      const skipReadOnlyTab = (columnIndex, rowIndex) => findNextEditableColumn(columnIndex, rowIndex, 1)
      const { columnIndex, rowIndex } = skipReadOnlyTab(nextCell.columnIndex, nextCell.rowIndex)

      nextCell.columnIndex = columnIndex
      nextCell.rowIndex = rowIndex
    } else {
      const skipReadOnlyShiftTab = (columnIndex, rowIndex) => findNextEditableColumn(columnIndex, rowIndex, -1)
      const { columnIndex, rowIndex } = skipReadOnlyShiftTab(nextCell.columnIndex, nextCell.rowIndex)

      nextCell.columnIndex = columnIndex
      nextCell.rowIndex = rowIndex
    }

    const field = columns[nextCell.columnIndex]?.field

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
          padding: '0 0px',
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
    const [currentValue, setCurrentValue] = useState(params?.node?.data) // Capture current data state

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

      setCurrentValue(changes)

      setData(changes, params)

      if (column.colDef.updateOn !== 'blur') {
        commit(changes)
        process(params, oldRow, setData)
      }
    }

    const updateRow = ({ changes }) => {
      const oldRow = params.data

      setCurrentValue(changes || '')

      setData(changes, params)

      if (params?.colDef?.disableDuplicate && checkDuplicates(params.colDef?.field, params.node?.data)) {
        stackDuplicate(params)

        return
      }

      if (column.colDef.updateOn !== 'blur') {
        commit(changes)

        process(params, oldRow, setData)
      }
    }

    const comp = column.colDef.component

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
          value={currentValue}
          column={{
            ...column.colDef,
            props: column?.colDef?.propsReducer ? column?.colDef?.propsReducer({ row: data, props }) : props
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
      if (
        gridContainerRef.current &&
        !gridContainerRef.current.contains(event.target) &&
        gridApiRef.current?.getEditingCells()?.length > 0
      ) {
        gridApiRef.current?.stopEditing()
      } else {
        return
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
        event.target.classList.contains('ag-center-cols-viewport') &&
        gridApiRef.current?.getEditingCells()?.length > 0
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

      rowNode.updateData(newData)
    }
  }

  const onCellEditingStopped = params => {
    const { data, colDef } = params
    if (colDef.updateOn === 'blur') {
      if (colDef?.disableDuplicate && checkDuplicates(colDef?.field, data) && !isDup.current) {
        stackDuplicate(params)

        return
      }

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
