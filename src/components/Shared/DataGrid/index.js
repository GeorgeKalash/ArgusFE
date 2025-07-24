import React, { useContext, useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, Checkbox, Grid, IconButton } from '@mui/material'
import components from './components'
import { CacheStoreProvider } from 'src/providers/CacheStoreContext'
import { GridDeleteIcon } from '@mui/x-data-grid'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY, accessLevel } from 'src/services/api/maxAccess'
import { useWindow } from 'src/windows'
import DeleteDialog from '../DeleteDialog'
import ConfirmationDialog from 'src/components/ConfirmationDialog'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { accessMap, TrxType } from 'src/resources/AccessLevels'
import isEqual from 'lodash/isEqual'
import { checkAccess } from 'src/lib/maxAccess'

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
  deleteHideCondition = '',
  onSelectionChange,
  rowSelectionModel,
  autoDelete,
  initialValues,
  bg,
  searchValue,
  onValidationRequired,
  setFieldValidation
}) {
  const gridApiRef = useRef(null)

  let lastCellStopped = useRef()

  const isDup = useRef(null)

  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const [ready, setReady] = useState(false)

  const skip = allowDelete ? 1 : 0

  const gridContainerRef = useRef(null)

  const generalMaxAccess = maxAccess && maxAccess?.record?.accessFlags

  const isAccessDenied = maxAccess?.editMode
    ? generalMaxAccess && !generalMaxAccess[accessMap[TrxType.EDIT]]
    : generalMaxAccess && !generalMaxAccess[accessMap[TrxType.ADD]]

  const _disabled = isAccessDenied || disabled

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

  const process = (params, oldRow, setData, disableRefocus) => {
    const column = columns.find(({ name }) => name === params.colDef.field)

    if (params.colDef?.disableDuplicate && checkDuplicates(params.colDef.field, params.data)) {
      return
    }

    const updateCommit = changes => {
      setData(changes, params)
      commit({ changes: { ...params.node.data, changes } })

      const focusedCell = params.api.getFocusedCell()

      const colId = focusedCell.column.colId

      const isUpdatedColumn = Object.keys(changes || {}).includes(colId)

      if (isUpdatedColumn && !disableRefocus) {
        params.api.stopEditing()

        setTimeout(() => {
          params.api.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: colId
          })
        }, 0)
      }
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

      if (params.rowIndex === value.length - 1 && column?.jumpToNextLine) {
        const highestIndex = value?.length
          ? value.reduce((max, current) => (max.id > current.id ? max : current)).id + 1
          : 1

        rows = [
          ...value.map(row => (row.id === updatedRow.id ? updatedRow : row)),
          {
            ...initialValues,
            id: highestIndex
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
              ? column?.jumpToNextLine
                ? addNewRow
                : () => {}
              : addRow
        }
      })
    }
  }

  async function deleteRow(params) {
    if (typeof autoDelete === 'function') {
      if (!(await autoDelete(params.data))) {
        return
      }
    }
    const newRows = value.filter(({ id }) => id !== params.data.id)
    gridApiRef.current.applyTransaction({ remove: [params.data] })
    if (newRows?.length < 1) setReady(true)

    onChange(newRows, 'delete', params.data)
  }

  function openDelete(params) {
    lastCellStopped.current = ''
    stack({
      Component: DeleteDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => deleteRow(params)
      },
      canExpand: false,
      refresh: false
    })
  }

  useEffect(() => {
    if (!value?.length && allowAddNewLine && ready) {
      addNewRow()
      setReady(false)
    }
  }, [ready, value])

  useEffect(() => {
    if (gridApiRef.current && rowSelectionModel) {
      const rowNode = gridApiRef.current.getRowNode(rowSelectionModel)
      if (rowNode) {
        rowNode.setSelected(true)
      }
    }
  }, [rowSelectionModel])

  useEffect(() => {
    if (!Array.isArray(value)) return
    if (typeof setFieldValidation !== 'function') return

    const newValidation = {}

    for (const column of columns) {
      const { name: fieldName, props = {} } = column
      const fullName = `${name}.${fieldName}`

      const { _required, _hidden } = checkAccess(
        fullName,
        props?.maxAccess,
        props?.required,
        props?.readOnly,
        props?.hidden
      )

      const hasCondition =
        typeof props.onCondition === 'function' || (_required && !_hidden) || props?.minValue || props?.maxValue

      if (!hasCondition) continue

      const condition = {}

      value.forEach((row, rowIndex) => {
        const result = props?.onCondition && props?.onCondition(row)
        if (result?.minValue != null || result?.maxValue != null) {
          condition[rowIndex] = {
            minValue: result.minValue,
            maxValue: result.maxValue
          }
        }
      })
      const minValue = props?.minValue
      const maxValue = props?.maxValue
      const required = props?.required

      // const newFieldValidation = {
      //   required: props.required || false,
      //   condition,
      //   minValue,
      //   maxValue
      // }

      const rowCondition = {}

      if (Object.keys(condition).length > 0) {
        rowCondition.condition = condition
      }
      if (required) {
        rowCondition.required = required
      }
      if (minValue != null) {
        rowCondition.minValue = minValue
      }
      if (maxValue != null) {
        rowCondition.maxValue = maxValue
      }

      if (Object.keys(rowCondition).length > 0) {
        newValidation[fullName] = rowCondition
      }

      // newValidation[fullName] = newFieldValidation
    }

    setFieldValidation(prev => {
      const isSame = isEqual(prev, newValidation)

      return isSame ? prev : newValidation
    })
  }, [value, columns, name])

  const addNewRow = () => {
    const highestIndex = Math.max(...value?.map(item => item.id), 0) + 1

    const newRow = {
      ...initialValues,
      id: highestIndex
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
            colKey: allColumns[0].name
          })
        }
        if (typeof onValidationRequired === 'function') onValidationRequired()
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

  const allColumns = columns?.filter(
    ({ name: field, hidden }) =>
      (accessLevel({ maxAccess, name: `${name}.${field}` }) !== HIDDEN && !hidden) ||
      (hidden && accessLevel({ maxAccess, name: `${name}.${field}` }) === FORCE_ENABLED)
  )

  const condition = (i, data) => {
    return (
      ((!allColumns?.[i]?.props?.readOnly &&
        accessLevel({ maxAccess, name: `${name}.${allColumns?.[i]?.name}` }) !== DISABLED) ||
        (allColumns?.[i]?.props?.readOnly &&
          (accessLevel({ maxAccess, name: `${name}.${allColumns?.[i]?.name}` }) === FORCE_ENABLED ||
            accessLevel({ maxAccess, name: `${name}.${allColumns?.[i]?.name}` }) === MANDATORY))) &&
      (typeof allColumns?.[i]?.props?.disableCondition !== 'function' ||
        !allColumns?.[i]?.props?.disableCondition(data)) &&
      (typeof allColumns?.[i]?.props?.onCondition !== 'function' ||
        !allColumns?.[i]?.props?.onCondition(data)?.hidden) &&
      (typeof allColumns?.[i]?.props?.onCondition !== 'function' ||
        !allColumns?.[i]?.props?.onCondition(data)?.disabled)
    )
  }

  const getUpdatedRowData = (rowIndex, api) => {
    return api.getDisplayedRowAtIndex(rowIndex)?.data || {}
  }

  const findNextEditableColumn = (columnIndex, rowIndex, direction, api) => {
    const limit = direction > 0 ? allColumns.length : -1
    const step = direction > 0 ? 1 : -1

    for (let i = columnIndex + step; i !== limit; i += step) {
      if (condition(i, getUpdatedRowData(rowIndex, api))) {
        return { columnIndex: i, rowIndex }
      }
    }

    for (let i = direction > 0 ? 0 : allColumns.length - 1; i !== limit; i += step) {
      if (condition(i, getUpdatedRowData(rowIndex + direction, api))) {
        return {
          columnIndex: i,
          rowIndex: rowIndex + direction
        }
      }
    }
  }

  const nextColumn = (columnIndex, data) => {
    let count = 0
    for (let i = columnIndex + 1; i < allColumns.length; i++) {
      if (condition(i, data)) {
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

    const countColumn = nextColumn(nextCell.columnIndex, data)

    if (
      (currentColumnIndex === allColumns.length - 1 - skip || !countColumn) &&
      node.rowIndex === api.getDisplayedRowCount() - 1
    ) {
      if (allowAddNewLine && !error && !_disabled) {
        event.stopPropagation()
        addNewRow()
      }
    }

    const currentCell = api.getFocusedCell()
    if (currentCell) {
      const focusElement = document.querySelector('[tabindex="1"]')

      if (event.target.tabIndex === 0 && document.querySelector('.ag-root') && focusElement && !event.shiftKey) {
        event.preventDefault()

        focusElement.focus()

        return
      }
    }

    const columns = gridApiRef.current.getColumnDefs()
    if (!event.shiftKey) {
      const skipReadOnlyTab = (columnIndex, rowIndex) => findNextEditableColumn(columnIndex, rowIndex, 1, api)
      const { columnIndex, rowIndex } = skipReadOnlyTab(nextCell.columnIndex, nextCell.rowIndex)

      nextCell.columnIndex = columnIndex
      nextCell.rowIndex = rowIndex
    } else {
      const skipReadOnlyShiftTab = (columnIndex, rowIndex) => findNextEditableColumn(columnIndex, rowIndex, -1, api)
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
    if (onSelectionChange) onSelectionChange(row, '', field)
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
        [field]: value ?? column.colDef?.defaultValue ?? ''
      }

      setCurrentValue(changes)

      setData(changes, params)

      if (column.colDef.updateOn !== 'blur' && value !== '.') {
        commit(changes)
        process(params, oldRow, setData)
      }
    }

    const updateRow = ({ changes, commitOnBlur }) => {
      const oldRow = params.data

      setCurrentValue(changes || '')

      setData(changes, params)

      if (params?.colDef?.disableDuplicate && checkDuplicates(params.colDef?.field, params.node?.data)) {
        stackDuplicate(params)

        return
      }

      if (column.colDef.updateOn !== 'blur' || commitOnBlur) {
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
          setFieldValidation={setFieldValidation}
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
    if (deleteHideCondition) {
      const shouldHide = Object.entries(deleteHideCondition).some(([key, value]) =>
        Array.isArray(value) ? value.includes(params.data[key]) : params.data[key] === value
      )

      if (shouldHide) return null
    }

    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}
        onClick={() => openDelete(params)}
      >
        <IconButton>
          <GridDeleteIcon sx={{ fontSize: '1.3rem' }} />
        </IconButton>
      </Box>
    )
  }

  const gridWidth = gridContainerRef?.current?.offsetWidth - 2

  const totalWidth =
    allColumns.filter(col => col?.width !== undefined)?.reduce((sum, col) => sum + col.width, 0) +
    (allowDelete ? 50 : 0)

  const additionalWidth =
    totalWidth > 0 && allColumns?.length > 0 && gridWidth > totalWidth
      ? (gridWidth - totalWidth) / allColumns?.length
      : 0

  const columnDefs = [
    ...allColumns.map(column => ({
      ...column,
      ...{ width: column.width + additionalWidth },
      field: column.name,
      headerName: column.label || column.name,
      headerTooltip: column.label,
      editable: !_disabled,
      flex: column.flex || (!column.width && 1),
      sortable: false,
      cellRenderer: CustomCellRenderer,
      cellEditor: CustomCellEditor,
      ...(column?.checkAll?.visible && {
        headerComponent: params => {
          const selectAll = e => {
            if (column?.checkAll?.onChange) {
              column?.checkAll?.onChange({ checked: e.target?.checked })
            }
          }

          return (
            <Grid container justifyContent='center' alignItems='center'>
              <CustomCheckBox
                checked={column?.checkAll?.value}
                onChange={e => {
                  selectAll(e)
                }}
                sx={{
                  width: '20%',
                  height: '20%',
                  marginLeft: '0px !important'
                }}
                disabled={column.checkAll?.disabled}
              />
            </Grid>
          )
        }
      }),
      cellEditorParams: { maxAccess },
      cellStyle: getCellStyle,
      suppressKeyboardEvent: params => {
        const { event } = params

        return event.code === 'ArrowDown' || event.code === 'ArrowUp' || event.code === 'Enter' ? true : false
      }
    })),
    allowDelete && !isAccessDenied
      ? {
          field: 'actions',
          headerName: '',
          width: 50,
          editable: false,
          sortable: false,
          cellRenderer: ActionCellRenderer
        }
      : null
  ].filter(Boolean)

  const commit = data => {
    const allRowNodes = []
    gridApiRef.current.forEachNode(node => allRowNodes.push(node.data))
    const updatedGridData = allRowNodes.map(row => (row.id === data?.id ? data : row))

    onChange(updatedGridData)
  }

  const onCellClicked = async params => {
    if (typeof onValidationRequired === 'function') onValidationRequired()

    const { colDef, rowIndex, api } = params

    api.startEditingCell({
      rowIndex: rowIndex,
      colKey: colDef.field
    })

    if (params?.data.id !== rowSelectionModel) {
      const selectedRow = params?.data
      if (onSelectionChange) {
        async function update({ newRow }) {
          updateState({
            newRow
          })
        }

        onSelectionChange(selectedRow, update, params.colDef.field)
      }
    }
  }

  useEffect(() => {
    function handleBlur(event) {
      if (
        (gridContainerRef.current &&
          !gridContainerRef.current.contains(event.target) &&
          gridApiRef.current?.getEditingCells()?.length > 0 &&
          !event.target.classList.contains('MuiBox-root') &&
          !event.target.classList.contains('MuiAutocomplete-option')) ||
        event.target.closest('.ag-header-row')
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

  const setData = (changes, params) => {
    const id = params.node?.id
    lastCellStopped.current = ''
    const rowNode = params.api.getRowNode(id)
    if (rowNode) {
      const currentData = rowNode.data

      const newData = { ...currentData, ...changes }

      rowNode.updateData(newData)
    }
  }

  const onCellEditingStopped = params => {
    const disableRefocus = true
    const cellId = `${params.node.id}-${params.column.colId}`
    const { data, colDef } = params
    let newValue = params?.data[params.column.colId]
    let currentValue = value?.[params.rowIndex]?.[params.column.colId]
    if (newValue == currentValue && newValue !== '.') return

    if (newValue?.toString()?.endsWith('.') && colDef.component === 'numberfield') {
      newValue = newValue.slice(0, -1).replace(/,/g, '')
      newValue = newValue != '' ? Number(val) : null
      newValue = isNaN(newValue) ? null : newValue

      const changes = {
        [colDef?.field]: newValue || undefined
      }
      setData(changes, params)
      commit(changes)
      if (colDef.updateOn != 'blur') process(params, data, setData, disableRefocus)
    }

    if (lastCellStopped.current == cellId) return
    lastCellStopped.current = cellId
    if (colDef.updateOn === 'blur' && data[colDef?.field] !== newValue?.[params?.columnIndex]?.[colDef?.field]) {
      if (colDef?.disableDuplicate && checkDuplicates(colDef?.field, data) && !isDup.current) {
        stackDuplicate(params)

        return
      }

      process(params, data, setData, disableRefocus)
    }
  }

  useEffect(() => {
    gridApiRef.current?.setQuickFilter(searchValue)
  }, [searchValue])

  return (
    <Box sx={{ height: height || 'auto', flex: 1 }}>
      <CacheStoreProvider>
        <Box
          className='ag-theme-alpine'
          style={{ height: '100%', width: '100%' }}
          sx={{
            fontSize: '0.9rem',
            '.ag-header': {
              height: '40px !important',
              minHeight: '40px !important'
            },
            '.ag-header-cell': {
              height: '40px !important',
              minHeight: '40px !important'
            },
            '.ag-cell': {
              borderRight: '1px solid #d0d0d0 !important',
              fontSize: '0.8rem !important'
            },
            '.ag-cell .MuiBox-root': {
              padding: '0px !important'
            },
            '.ag-header-row': {
              background: bg,
              height: '35px !important',
              minHeight: '35px !important'
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
              rowHeight={35}
              getRowId={params => params?.data?.id}
              tabToNextCell={() => true}
              tabToPreviousCell={() => true}
              onCellEditingStopped={onCellEditingStopped}
              enableBrowserTooltips={true}
            />
          )}
        </Box>
      </CacheStoreProvider>
    </Box>
  )
}
