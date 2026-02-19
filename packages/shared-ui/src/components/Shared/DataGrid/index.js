import React, { useContext, useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, IconButton, Link } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import components from './components'
import { CacheStoreProvider } from '@argus/shared-providers/src/providers/CacheStoreContext'
import { GridDeleteIcon } from '@mui/x-data-grid'
import { DISABLED, FORCE_ENABLED, HIDDEN, MANDATORY, accessLevel } from '@argus/shared-utils/src/utils/maxAccess'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import DeleteDialog from '../DeleteDialog'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { accessMap, TrxType } from '@argus/shared-domain/src/resources/AccessLevels'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

export function DataGrid({
  name,
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
  isDeleteDisabled
}) {
  const gridApiRef = useRef(null)
  const { user } = useContext(AuthContext)
  let lastCellStopped = useRef()
  const isDup = useRef(null)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [ready, setReady] = useState(false)
  const [columnState, setColumnState] = useState()
  const skip = allowDelete ? 1 : 0
  const gridContainerRef = useRef(null)

  const generalMaxAccess = maxAccess && maxAccess?.record?.accessFlags
  const isAccessDenied = maxAccess?.editMode
    ? generalMaxAccess && !generalMaxAccess[accessMap[TrxType.EDIT]]
    : generalMaxAccess && !generalMaxAccess[accessMap[TrxType.ADD]]

  const _disabled = isAccessDenied || disabled

  const { width } = useWindowDimensions()

  const rowHeight =
    width <= 768 ? 30 : width <= 1024 ? 25 : width <= 1280 ? 25 : width < 1600 ? 30 : 35

  const GridCheckbox = ({ checked, disabled, onChange }) => {
    return (
      <Checkbox
        className={`fullSizeCheckbox`}
        checked={!!checked}
        disabled={!!disabled}
        onChange={onChange}
      />
    )
  }

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

    const addRow = async (param = {}) => {
      const { changes } = param
      if (!changes) {
        if (params.rowIndex === value.length - 1) {
          addNewRow(params)
        }
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

  const BUTTON_SELECTOR = [
    'button:not([disabled])',
    '[role="button"]:not(.Mui-disabled)',
    '.MuiButtonBase-root:not(.Mui-disabled)',
    '.MuiIconButton-root:not(.Mui-disabled)',
    '.MuiButton-root:not(.Mui-disabled)',
    '.MuiFab-root:not(.Mui-disabled)',
    '.MuiListItemButton-root:not(.Mui-disabled)'
  ].join(',')

  useEffect(() => {
    const isInsideAgGridUX = (el, e) => {
      if (!el) return false
      const root = gridContainerRef.current
      const path = e?.composedPath?.()
      const withinContainer = !!(root && (root.contains(el) || path?.includes(root)))

      const agStructure = !!(
        el.closest('.ag-root') ||
        el.closest('.ag-cell') ||
        el.closest('.ag-header') ||
        el.closest('.ag-header-row') ||
        el.closest('.ag-popup') ||
        el.closest('.ag-overlay') ||
        el.closest('.ag-tooltip')
      )

      return withinContainer || agStructure
    }

    const commitIfEditing = () => {
      const api = gridApiRef.current
      if (!api) return
      const editing = api.getEditingCells?.() || []
      if (editing.length) {
        api.stopEditing()
        api.flushAsyncTransactions?.()
      }
    }

    const onPointerDownCapture = e => {
      const target = e.target
      if (!target) return

      const pressedButton = target.closest(BUTTON_SELECTOR)

      if (gridApiRef.current?.getEditingCells()?.length == 0) return
      if (!pressedButton || pressedButton.closest('.MuiPaper-root')) return
      if (isInsideAgGridUX(pressedButton, e)) return
      if (gridApiRef.current?.getEditingCells()?.length > 0) {
        commitIfEditing()
      }
    }

    window.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDownCapture, true)
    }
  }, [])

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

    if (currentColumnIndex === allCols.length - 1 - skip && node.rowIndex === api.getDisplayedRowCount() - 1) {
      if ((error || !allowAddNewLine) && !event.shiftKey) {
        event.stopPropagation()
        return
      }
    }

    const countColumn = nextColumn(nextCell.columnIndex, data)

    if (
      (currentColumnIndex === allCols.length - 1 - skip || !countColumn) &&
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

    const comp =
      typeof column.colDef?.component === 'string' ? column.colDef.component : column.colDef?.component
    const isCheckbox = comp === 'checkbox'

    if (isCheckbox) {
      const disabledCheckbox = _disabled || !!column.colDef?.props?.readOnly

      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <GridCheckbox
            checked={params.value}
            disabled={disabledCheckbox}
            onChange={e => {
              e.preventDefault()
              e.stopPropagation()

              const rowIndex = params.node.rowIndex
              const colId = params.column?.getColId?.() || params.colDef.field

              params.api.setFocusedCell(rowIndex, colId)
              params.api.ensureIndexVisible(rowIndex)
              if (!params.node.isSelected?.() && params.node.setSelected) params.node.setSelected(true)

              const checked = e.target.checked

              params.node.setDataValue(params.colDef.field, checked)

              const changes = { [params.colDef.field]: checked }
              setData(changes, params)
              commit({ ...params.data, ...changes })

              if (params.colDef.updateOn !== 'blur') {
                process(params, params.data, setData)
              }
            }}
          />
        </Box>
      )
    }

    if (column.colDef?.link?.enabled) {
      const { getHref, target, popup, onClick } = column.colDef.link
      const linkHref = typeof getHref === 'function' ? getHref(params.data) : '#'

      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            padding: '0',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Link
            href={popup ? '#' : linkHref}
            target={!popup ? target || '_self' : undefined}
            rel={!popup && target === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={e => {
              e.stopPropagation()
              if (popup) {
                e.preventDefault()
                popup(params.data)
                return
              }
              onClick?.(params.data)
            }}
            style={{
              color: '#1976d2',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            {params.value}
          </Link>
        </Box>
      )
    }

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
      <Box className={`cellBox`}>
        <Component {...params} column={column.colDef} updateRow={updateRow} update={update} />
      </Box>
    )
  }

  const CustomCellEditor = params => {
    const { column, data, maxAccess } = params
    const [currentValue, setCurrentValue] = useState(params?.node?.data)

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
    const centered = comp === 'checkbox' || comp === 'button' || comp === 'icon'

    return (
      <Box className={`cellEditorBox ${centered ? 'cellEditorBoxCentered' : ''} `}>
        <Box className={`cellEditorInner ${centered ? 'cellEditorInnerCentered' : ''}`}>
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
      </Box>
    )
  }

  const cellClassRules = {
    'cell-error': params => !!error?.[params.node.rowIndex]?.[params.colDef.field]
  }

  const ActionCellRenderer = params => {
    if (deleteHideCondition) {
      const shouldHide = Object.entries(deleteHideCondition).some(([key, value]) =>
        Array.isArray(value) ? value.includes(params.data[key]) : params.data[key] === value
      )
      if (shouldHide) return null
    }

    const disabledForRow = typeof isDeleteDisabled === 'function' ? isDeleteDisabled(params.data) : false

    return (
      <Box
        className={'actionCell'}
        onClick={() => openDelete(params)}
        sx={{
          pointerEvents: disabledForRow ? 'none' : 'auto'
        }}
      >
        <IconButton disabled={disabledForRow}>
          <GridDeleteIcon className={'deleteIcon'} />
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
    ...allColumns.map(column => {
      const mergedCellClass = [column.cellClass, 'wrapTextCell']

      const centered =
        column.component === 'checkbox' || column.component === 'button' || column.component === 'icon'
          ? 'cellBoxCentered'
          : 'noCenterCell'

      return {
        ...column,
        ...{ width: column.width + additionalWidth },
        field: column.name,
        headerName: column.label || column.name,
        headerTooltip: column.label,
        editable: column.component === 'checkbox' ? false : !_disabled,
        flex: column.flex || (!column.width && 1),
        sortable: false,
        cellRenderer: CustomCellRenderer,
        cellEditor: CustomCellEditor,
        wrapText: true,
        autoHeight: true,
        cellClass: `${mergedCellClass || undefined}  ${centered}`,
        ...(column?.checkAll?.visible && {
          headerClass: 'agHeaderCheckboxCell',
          headerComponent: params => {
            const selectAll = e => {
              e.preventDefault()
              e.stopPropagation()

              const colId = params.column.getColId()
              params.api.ensureColumnVisible(colId)
              const root = params.api.getGui && params.api.getGui()
              const headerRoot = root ? root.querySelector('.ag-header') : document.querySelector('.ag-header')
              const cell = headerRoot && headerRoot.querySelector(`.ag-header-cell[col-id="${colId}"]`)
              const focusable = cell && (cell.querySelector('.ag-focus-managed') || cell)
              focusable && focusable.focus && focusable.focus()

              if (column?.checkAll?.onChange) {
                column?.checkAll?.onChange({ checked: e.target?.checked })
              }
            }

            return (
              <GridCheckbox
                checked={!!column?.checkAll?.value}
                disabled={!!column?.checkAll?.disabled}
                onChange={selectAll}
              />
            )
          },
          suppressMenu: true
        }),

        cellEditorParams: { maxAccess },
        cellClassRules: cellClassRules,
        suppressKeyboardEvent: params => {
          const { event } = params
          return event.code === 'ArrowDown' || event.code === 'ArrowUp' || event.code === 'Enter' ? true : false
        }
      }
    }),
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
    if (params.event.target.closest('a')) return
    if (typeof onValidationRequired === 'function') onValidationRequired()

    const { colDef, rowIndex, api } = params

    const nonEditableByClick =
      colDef.component === 'button' || colDef.component === 'checkbox' || colDef.component === 'icon'

    if (!nonEditableByClick) {
      api.startEditingCell({
        rowIndex: rowIndex,
        colKey: colDef.field
      })
    }

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
      const pressedButton = event.target.closest(BUTTON_SELECTOR)

      if (
        !event.target.closest('.ag-cell') &&
        !pressedButton?.closest('.MuiPaper-root') &&
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
    const cellId = `${params.node.id}-${params.column.colId}`
    const { data, colDef } = params
    const disableRefocus = colDef?.component === 'numberfield'

    let newValue = params?.data[params.column.colId]
    let currentValue = value?.[params.rowIndex]?.[params.column.colId]
    if (newValue == currentValue && newValue !== '.') return

    if (newValue?.toString()?.endsWith('.') && colDef.component === 'numberfield') {
      newValue = newValue.slice(0, -1).replace(/,/g, '')
      newValue = newValue != '' ? Number(newValue) : null
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

  const onColumnResized = params => {
    if (params?.source === 'uiColumnResized') {
      const columnState = params.columnApi.getColumnState()
      setColumnState(columnState)
    }
  }

  const finalColumns =  columnDefs?.map(def => {
    const colId = def.field
    const state = columnState?.find(s => s.colId === colId)
    if (!state) return def

    return {
      ...def,
      flex: undefined,
      width: state.width
    }
  })

  return (
    <Box className={'root'} sx={{ height: height || 'auto' }}>
      <CacheStoreProvider>
        <Box className={`ag-theme-alpine agContainer`} ref={gridContainerRef} style={{ '--ag-header-bg': bg }}>
          {value && (
            <AgGridReact
              gridApiRef={gridApiRef}
              rowData={value}
              columnDefs={finalColumns}
              rowHeight={rowHeight}
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
              onColumnResized={onColumnResized}
              getRowId={params => params?.data?.id}
              tabToNextCell={() => true}
              tabToPreviousCell={() => true}
              onCellEditingStopped={onCellEditingStopped}
              enableBrowserTooltips={true}
              enableRtl={user?.languageId === 2}
              suppressFocusAfterRefresh={true}
            />
          )}
        </Box>
      </CacheStoreProvider>

      <style jsx global>{`
        .root {
          flex: 1;
        }

        .agContainer {
          width: 100%;
          height: 100%;
          flex: 1;
        }

        .agContainer.ag-theme-alpine {
          --ag-header-height: 20px !important;
          --ag-font-size: 0.9rem;
        }

        .agContainer :global(.ag-header),
        .agContainer :global(.ag-header-cell),
        .agContainer :global(.ag-header-row) {
          height: 40px !important;
          min-height: 40px !important;
          background: var(--ag-header-bg, #f5f5f5);
        }

        .agContainer :global(.ag-header-cell-text) {
          font-size: 0.9rem;
        }

        .agContainer :global(.agHeaderCheckboxCell.ag-header-cell) {
          padding: 0 !important;
        }

        .agContainer :global(.agHeaderCheckboxCell .ag-header-cell-label) {
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .agContainer :global(.agHeaderCheckboxCell .ag-header-cell-comp-wrapper) {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
        }
        .agContainer :global(.fullSizeCheckbox) {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .agContainer :global(.MuiCheckbox-root) {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .agContainer :global(.MuiCheckbox-root .MuiSvgIcon-root) {
          font-size: 20px !important;
        }

        .agContainer :global(.cellBox) {
          overflow: hidden;
        }

        .agContainer :global(.ag-cell) {
          border-right: 1px solid #d0d0d0 !important;
          font-size: 0.8rem !important;
          line-height: 1.1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .agContainer :global(.ag-cell-wrapper),
        .agContainer :global(.ag-cell-value) {
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 0px !important;
        }

        .agContainer :global(.ag-cell .MuiBox-root) {
          display: flex;
          align-items: center;
          height: auto;
          padding: 0 !important;
        }

        .agContainer :global(.MuiIconButton-root) {
          padding: 0 !important;
        }

        .cellBox,
        .cellEditorBox {
          width: 100% !important;
          height: auto;
          padding: 0px !important;
          display: flex;
        }

        .agContainer:dir(ltr) :global(.noCenterCell) {
          padding-right: 0 !important;
        }
        .agContainer:dir(rtl) :global(.noCenterCell) {
          padding-left: 0 !important;
        }

        .agContainer :global(.ag-cell.cellBoxCentered) {
          justify-content: center;
          padding: 0 !important;
          margin: 0 !important;
        }

        .cellEditorBoxCentered {
          justify-content: center;
        }
        .cellEditorInner {
          width: 100%;
          height: auto;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        .cellEditorInnerCentered {
          justify-content: center;
        }

        .actionCell {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
        }

        .deleteIcon,
        .cellIcon {
          font-size: 1.3rem !important;
        }

        .wrapTextCell :global(.ag-cell-wrapper),
        .wrapTextCell :global(.ag-cell-value) {
          white-space: normal;
          line-height: 1.2;
          height: auto;
        }

        .wrapTextCell .cellBox {
          height: auto;
        }

        .agContainer :global(.ag-cell.cell-error) {
          border: 1px solid #ff0000 !important;
        }

        .agContainer :global(.ag-cell.ag-cell-focus:not(.cell-error)),
        .agContainer :global(.ag-cell.ag-cell-inline-editing:not(.cell-error)),
        .agContainer :global(.ag-cell.ag-cell-inline-editing.ag-cell-focus:not(.cell-error)) {
          box-shadow: none !important;
          outline: none !important;
          border-color: transparent !important;
          border-radius: 0px !important;
        }

        .agContainer :global(.ag-cell),
        .agContainer :global(.ag-cell-focus),
        .agContainer :global(.ag-cell.ag-cell-inline-editing) {
          border-right: 1px solid #d0d0d0 !important;
        }

        @media (max-width: 1599px) {
          .agContainer.ag-theme-alpine {
            --ag-font-size: 11px;
          }

          .agContainer :global(.ag-header),
          .agContainer :global(.ag-header-cell),
          .agContainer :global(.ag-header-row) {
            min-height: 33px !important;
            height: 33px !important;
          }

          .agContainer :global(.ag-header-cell-text),
          .agContainer :global(.ag-cell) {
            font-size: 11px !important;
          }
        }

        @media (max-width: 1280px) {
          .agContainer.ag-theme-alpine {
            --ag-header-height: 26px;
            --ag-font-size: 10px;
          }

          .agContainer :global(.ag-header-cell) {
            padding-inline: 5px !important;
          }

          .agContainer:dir(ltr) :global(.noCenterCell:not(.ag-cell-inline-editing)) {
            padding-left: 5px !important;
          }

          .agContainer:dir(rtl) :global(.noCenterCell:not(.ag-cell-inline-editing)) {
            padding-right: 5px !important;
          }

          .agContainer :global(.ag-header),
          .agContainer :global(.ag-header-cell) {
            height: 29px !important;
            min-height: 29px !important;
          }

          .agContainer :global(.ag-header-cell-text),
          .agContainer :global(.ag-cell) {
            font-size: 10px !important;
          }

          .agContainer :global(.agHeaderCheckboxCell.ag-header-cell) {
            padding: 0 !important;
          }
          .agContainer :global(.agHeaderCheckboxCell .ag-header-cell-label) {
            padding: 0 !important;
          }
        }

        @media (max-width: 1024px) {
          .agContainer.ag-theme-alpine {
            --ag-font-size: 10px;
          }

          .agContainer :global(.ag-header),
          .agContainer :global(.ag-header-cell) {
            height: 29px !important;
            min-height: 28px !important;
          }

          .agContainer :global(.ag-header-cell-text),
          .agContainer :global(.ag-cell) {
            font-size: 9px !important;
          }
        }

        @media (max-width: 834px) {
          .agContainer.ag-theme-alpine {
            --ag-header-height: 26px;
            --ag-font-size: 9px;
          }

          .agContainer :global(.ag-header),
          .agContainer :global(.ag-header-cell) {
            height: 26px !important;
            min-height: 26px !important;
          }

          .agContainer :global(.ag-header-cell-text),
          .agContainer :global(.ag-cell) {
            font-size: 9px !important;
          }
        }

        @media (max-width: 1600px) {
          .deleteIcon,
          .cellIcon {
            font-size: 1.2rem !important;
          }
        }

        @media (max-width: 1366px) {
          .deleteIcon,
          .cellIcon {
            font-size: 1.1rem !important;
          }
        }

        @media (max-width: 1024px) {
          .deleteIcon,
          .cellIcon {
            font-size: 1rem !important;
          }
        }

        @media (max-width: 768px) {
          .deleteIcon,
          .cellIcon {
            font-size: 0.95rem !important;
          }
        }

        @media (max-width: 600px) {
          .deleteIcon,
          .cellIcon {
            font-size: 0.9rem !important;
          }
        }

        @media (max-width: 480px) {
          .deleteIcon,
          .cellIcon {
            font-size: 0.85rem !important;
          }
        }

        @media (max-width: 375px) {
          .deleteIcon,
          .cellIcon {
            font-size: 0.8rem !important;
          }
        }

        .agContainer :global(.ag-cell .wrap) {
          white-space: normal;
          line-height: 1.2;
          display: flex;
          align-items: center;
        }

        .agContainer :global(.ag-cell img),
        .agContainer :global(.ag-cell svg),
        .agContainer :global(.ag-cell .MuiSvgIcon-root) {
          vertical-align: middle;
        }
      `}</style>
    </Box>
  )
}
