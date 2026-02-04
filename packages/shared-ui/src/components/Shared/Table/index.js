import React, { useContext, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, IconButton, TextField } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import Image from 'next/image'
import editIcon from '@argus/shared-ui/src/components/images/TableIcons/edit.png'
import { useState } from 'react'
import { useEffect } from 'react'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LastPageIcon from '@mui/icons-material/LastPage'
import RefreshIcon from '@mui/icons-material/Refresh'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { TrxType, accessMap } from '@argus/shared-domain/src/resources/AccessLevels'
import deleteIcon from '@argus/shared-ui/src/components/images/TableIcons/delete.png'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import DeleteDialog from '../DeleteDialog'
import StrictConfirmation from '../StrictConfirmation'
import { HIDDEN, accessLevel } from '@argus/shared-utils/src/utils/maxAccess'
import { formatDateDefault, getTimeInTimeZone, formatDateTimeDefault } from '@argus/shared-domain/src/lib/date-helper'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useQuery } from '@tanstack/react-query'
import CachedIcon from '@mui/icons-material/Cached'
import { getFromDB, saveToDB, deleteFromDB } from '@argus/shared-domain/src/lib/indexDB'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

const Table = ({
  name,
  paginationType = '',
  globalStatus = true,
  viewCheckButtons = false,
  showCheckboxColumn = false,
  disableSorting = false,
  rowSelection = '',
  pagination = true,
  setData,
  checkboxFlex = '',
  handleCheckboxChange = '',
  showSelectAll = true,
  onSelectionChange,
  selectionMode = 'row',
  rowDragManaged = false,
  onRowDragEnd = false,
  collabsable = true,
  domLayout = 'normal',
  ...props
}) => {
  const pageSize = props?.pageSize || 10000
  const api = props?.api ? props?.api : props?.paginationParameters || ''
  const refetch = props?.refetch
  const [gridData, setGridData] = useState({})
  const [page, setPage] = useState(null)
  const [startAt, setStartAt] = useState(0)
  const { languageId } = useContext(AuthContext)
  const { platformLabels } = useContext(ControlContext)
  const maxAccess = props?.maxAccess && props?.maxAccess?.record?.accessFlags
  const columnsAccess = props?.maxAccess && props?.maxAccess?.record?.controls
  const { stack } = useWindow()
  const [checked, setChecked] = useState(false)
  const [focus, setFocus] = useState(false)
  const hasRowId = gridData?.list?.[0]?.id
  const storeName = 'tableSettings'
  const gridRef = useRef(null)
  const [hoveredTable, setHoveredTable] = useState(false)

  const { width } = useWindowDimensions()

  const rowHeight =
    width <= 768 ? 30 : width <= 1024 ? 26 : width <= 1280 ? 25 : width <= 1366 ? 28 : width < 1600 ? 30 : 32

  const rowHeightImage =
    width <= 768 ? 44 : width <= 1024 ? 46 : width <= 1280 ? 50 : width <= 1366 ? 50 : width < 1600 ? 52 : 70

  const columns = props?.columns
    .filter(
      ({ field }) =>
        accessLevel({
          maxAccess: props?.maxAccess,
          name: name ? `${name}.${field}` : field
        }) !== HIDDEN
    )
    .map(col => {
      if (col.type === 'date') {
        return {
          ...col,
          valueGetter: ({ data }) => parseDateValue(data?.[col.field]),
          cellRenderer: params => params?.value && formatDateDefault(`/Date(${params?.value})/`),
          comparator: dateComparator,
          sortable: !disableSorting
        }
      }
      if (col.type === 'dateTime') {
        return {
          ...col,
          valueGetter: ({ data }) => parseDateValue(data?.[col.field]),
          cellRenderer: params => params?.value && formatDateTimeDefault(`/Date(${params?.value})/`, col?.dateFormat),
          comparator: dateComparator,
          sortable: !disableSorting
        }
      }
      if (col.type === 'number' || col?.type?.field === 'number') {
        return {
          ...col,
          valueGetter: ({ data }) => getFormattedNumber(data?.[col.field], col.type?.decimal, col.type?.round),
          cellStyle: params => ({
            fontWeight: params.data?.isBold ? 'bold' : 'normal',
            textAlign: languageId === 2 ? 'left' : 'right'
          }),
          sortable: !disableSorting
        }
      }
      if (col.type === 'timeZone') {
        return {
          ...col,
          valueGetter: ({ data }) => data?.[col.field] && getTimeInTimeZone(data?.[col.field]),
          sortable: !disableSorting
        }
      }
      if (col.type === 'checkbox') {
        return {
          ...col,
          width: 110,
          cellRenderer: ({ data, node }) => {
            const handleCheckboxChange = event => {
              const checked = event.target.checked
              node.setDataValue(col.field, checked)
            }

            return (
              <Checkbox
                checked={data?.[col.field]}
                onChange={col.editable ? handleCheckboxChange : null}
                className={col.editable ? '' : 'pointerNone'}
              />
            )
          }
        }
      }
      if (col.type === 'colorCombo') {
        return {
          ...col,
          cellRenderer: ({ data }) => {
            const color = data?.[col.field]

            return color ? (
              <div className={'colorComboWrapper'}>
                <div className={'colorSwatch'} style={{ backgroundColor: color }} />
                <span>{color}</span>
              </div>
            ) : null
          }
        }
      }

      return {
        ...col,
        sortable: !disableSorting,
        cellStyle: params => ({
          fontWeight: params.data?.isBold ? 'bold' : 'normal'
        })
      }
    })

  function dateComparator(date1, date2) {
    if (date1 == null && date2 == null) return 0
    if (date1 == null) return -1
    if (date2 == null) return 1

    return date1 - date2
  }

  function parseDateValue(value) {
    if (!value) return null
    if (typeof value === 'string') {
      const match = value.match(/\d+/)

      return match ? parseInt(match[0], 10) : null
    }

    return value instanceof Date ? value.getTime() : value
  }

  const shouldRemoveColumn = column => {
    const match = columnsAccess && columnsAccess.find(item => item.controlId === column.id)

    return match && match.accessLevel === ControlAccessLevel.Hidden
  }
  const filteredColumns = columns.filter(column => !shouldRemoveColumn(column))

  useEffect(() => {
    const areAllValuesTrue =
      props?.gridData?.list?.length > 0 && props?.gridData?.list?.every(item => item?.checked === true)
    setChecked(areAllValuesTrue)
    if (typeof setData === 'function') {
      onSelectionChanged()
    }
    if (props?.gridData && paginationType !== 'api' && pageSize) {
      if (page) {
        const start = (page - 1) * pageSize
        const end = page * pageSize
        const slicedGridData = props?.gridData?.list?.slice(start, end)
        setGridData({
          ...props.gridData,
          list: slicedGridData
        })
        setStartAt(start)
      } else {
        setGridData({ list: pageSize ? props?.gridData?.list?.slice(0, pageSize) : props?.gridData?.list })
      }
    }
  }, [props?.gridData])

  const CustomPagination = () => {
    if (pagination) {
      const TextInput = ({ value, pageCount }) => {
        const jumpToPage = e => {
          setFocus(false)
          const newPage = e.target.value

          if ((e.key === 'Enter' || e.keyCode === 13) && newPage > 0)
            if (paginationType === 'api') {
              api({ _startAt: (newPage - 1) * pageSize, _pageSize: pageSize })
            } else {
              var slicedGridData = props?.gridData?.list?.slice((newPage - 2) * pageSize, newPage * pageSize)
              setGridData({
                ...props?.gridData?.list,
                list: slicedGridData
              })
              setStartAt((newPage - 2) * pageSize + pageSize)
            }
          setFocus(true)
        }

        const handleInput = e => {
          if (e.target.value > pageCount || e.target.value < 0) e.target.value = value
          if (e.target.value === '0') e.target.value = value
        }

        return (
          <TextField
            size={'small'}
            className={'pageTextField'}
            autoFocus={focus}
            onInput={handleInput}
            defaultValue={value}
            onKeyUp={jumpToPage}
            onBlur={() => setFocus(false)}
          />
        )
      }
      if (paginationType === 'api') {
        const gridData = props?.gridData
        const startAt = gridData?._startAt ?? 0
        const totalRecords = gridData?.count ? gridData?.count : 0
        const page = Math.ceil(gridData?.count ? (startAt === 0 ? 1 : (startAt + 1) / pageSize) : 1)
        const pageCount = Math.ceil(gridData?.count ? gridData.count / pageSize : 1)

        const incrementPage = () => {
          if (page < pageCount) {
            api({ _startAt: page * pageSize, _pageSize: pageSize })
          }
        }

        const decrementPage = () => {
          if (page > 1) {
            api({ _startAt: (page - 2) * pageSize, _pageSize: pageSize })
          }
        }

        const goToFirstPage = () => {
          api({ _startAt: 0, _pageSize: pageSize })
        }

        const goToLastPage = () => {
          api({ _startAt: (pageCount - 1) * pageSize, _pageSize: pageSize })
        }

        return (
          <Box className={'paginationWrapper'}>
            <Box className={'paginationBar'}>
              <IconButton
                onClick={goToFirstPage}
                disabled={page === 1}
                sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
              >
                <FirstPageIcon />
              </IconButton>
              <IconButton
                onClick={decrementPage}
                disabled={page === 1}
                sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              {platformLabels.Page}
              <TextInput value={page} pageCount={pageCount} />
              {platformLabels.Of} {pageCount}
              <IconButton
                onClick={incrementPage}
                disabled={page === pageCount}
                sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
              >
                <NavigateNextIcon />
              </IconButton>
              <IconButton
                onClick={goToLastPage}
                disabled={page === pageCount}
                sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
              >
                <LastPageIcon />
              </IconButton>
              <IconButton onClick={refetch}>
                <RefreshIcon />
              </IconButton>
              {platformLabels.DisplayingRecords} {startAt === 0 ? 1 : startAt} -{' '}
              {totalRecords < pageSize ? totalRecords : page === pageCount ? totalRecords : startAt + pageSize}{' '}
              {platformLabels.Of} {totalRecords}
            </Box>
            <Box>
              <IconButton onClick={onReset} className={'paginationBar'}>
                <CachedIcon />
              </IconButton>
            </Box>
          </Box>
        )
      } else {
        const gridData = props?.gridData

        if (gridData && gridData?.list) {
          const originalGridData = gridData && gridData.list
          setPage(Math.ceil(gridData.count ? (startAt === 0 ? 1 : (startAt + 1) / pageSize) : 1))

          var _gridData = gridData?.list
          const pageCount = Math.ceil(originalGridData?.length ? originalGridData?.length / pageSize : 1)
          const totalRecords = originalGridData?.length

          const incrementPage = () => {
            if (page < pageCount) {
              var slicedGridData = _gridData.slice(page * pageSize, (page + 1) * pageSize)
              setGridData({
                ...gridData,
                list: slicedGridData
              })

              setStartAt(startAt + pageSize)
            }
          }

          const decrementPage = () => {
            if (page > 1) {
              var slicedGridData = _gridData.slice((page - 2) * pageSize, (page - 1) * pageSize)
              setGridData({
                ...gridData,
                list: slicedGridData
              })
              setStartAt(startAt - pageSize)
            }
          }

          const goToFirstPage = () => {
            if (page > 1) {
              var slicedGridData = _gridData.slice(
                0,
                originalGridData.length > pageSize ? pageSize : originalGridData.length
              )
              setGridData(prev => ({
                ...prev,
                list: slicedGridData
              }))
              setStartAt(0)
            }
          }

          const goToLastPage = () => {
            if (page < pageCount) {
              var slicedGridData = _gridData.slice((pageCount - 1) * pageSize, originalGridData.length)
              setGridData({
                ...gridData,
                list: slicedGridData
              })
              const pageNumber = parseInt(originalGridData.length / pageSize)
              const start = pageSize * pageNumber
              setStartAt(start)
            }
          }

          return (
            <Box className={'paginationWrapper'}>
              <Box className={'paginationBar'}>
                <IconButton
                  onClick={goToFirstPage}
                  disabled={page === 1}
                  sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
                >
                  <FirstPageIcon />
                </IconButton>
                <IconButton
                  onClick={decrementPage}
                  disabled={page === 1}
                  sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                {platformLabels.Page} <TextInput value={page} pageCount={pageCount} /> {platformLabels.Of} {pageCount}
                <IconButton
                  onClick={incrementPage}
                  disabled={page === pageCount}
                  sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
                >
                  <NavigateNextIcon />
                </IconButton>
                <IconButton
                  onClick={goToLastPage}
                  disabled={page === pageCount}
                  sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }}
                >
                  <LastPageIcon />
                </IconButton>
                <IconButton onClick={refetch}>
                  <RefreshIcon />
                </IconButton>
                {platformLabels.DisplayingRecords} {startAt === 0 ? 1 : startAt} -{' '}
                {totalRecords < pageSize ? totalRecords : page === pageCount ? totalRecords : startAt + pageSize}
                {' ' + platformLabels.Of} {totalRecords}
              </Box>
              <Box>
                <IconButton onClick={onReset}>
                  <CachedIcon />
                </IconButton>
              </Box>
            </Box>
          )
        }
      }
    }
  }

  const selectAll = (params, e) => {
    const gridApi = params.api
    const allNodes = []
    gridApi.forEachNode(node => allNodes.push(node))

    allNodes.forEach(node => {
      node.data.checked = e.target.checked
      node.setDataValue('checked', e.target.checked)
    })

    setChecked(e.target.checked)
    const data = allNodes.map(rowNode => rowNode.data)

    if (handleCheckboxChange) {
      handleCheckboxChange(data, e.target.checked)
    }

    if (typeof setData === 'function') onSelectionChanged
  }

  const onSelectionChanged = params => {
    const gridApi = params?.api
    const selectedNodes = gridApi?.getSelectedNodes()
    const selectedData = selectedNodes?.map(node => node.data)
    setData(selectedData)
  }

  function openDelete(obj) {
    stack({
      Component: DeleteDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => props?.onDelete(obj)
      },
      refresh: false
    })
  }

  function openDeleteConfirmation(obj) {
    stack({
      Component: StrictConfirmation,
      props: {
        action() {
          props?.onDelete(obj)
        },
        type: 'delete'
      },
      refresh: false
    })
  }

  const checkboxCellRenderer = params => {
    return (
      <Checkbox
        className={'fullSizeCheckbox'}
        checked={params.value}
        disabled={(props?.disable && props?.disable(params?.data)) || props?.disableCheckBox}
        onChange={e => {
          e.preventDefault()
          const rowIndex = params.node.rowIndex
          const colId = params.column?.getColId?.() || params.colDef.field
          params.api.setFocusedCell(rowIndex, colId)
          params.api.ensureIndexVisible(rowIndex)
          if (!params.node.isSelected()) params.node.setSelected(true)

          const checked = e.target.checked
          if (rowSelection !== 'single') {
            params.node.setDataValue(params.colDef.field, checked)
          } else {
            params.api.forEachNode(node => {
              if (node.id === params.node.id) {
                node.setDataValue(params.colDef.field, checked)
              } else if (checked) {
                node.setDataValue(params.colDef.field, false)
              }
            })
          }

          if (handleCheckboxChange) {
            handleCheckboxChange(params.data, e.target.checked)
          }
        }}
      />
    )
  }

  const onFirstDataRendered = async params => {
    await params.api.forEachNode(node => {
      if (rowSelection === 'single') {
        const checked = node.data?.checked || false
        node.setDataValue('checked', checked)
      }
    })
  }

  const FieldWrapper = params => {
    const [tooltipOpen, setTooltipOpen] = useState(false)

    const handleClick = event => {
      if (selectionMode === 'row' && onSelectionChange) {
        onSelectionChange(params.data, params.rowIndex)
      } else if (selectionMode === 'column' && onSelectionChange) {
        const columnValues = params.api.getDisplayedRowCount()
          ? Array.from(
              { length: params.api.getDisplayedRowCount() },
              (_, i) => params.api.getDisplayedRowAtIndex(i).data[params.colDef.field]
            )
          : []

        onSelectionChange(columnValues, params.colDef.field)
      }

      const range = document.createRange()
      range.selectNodeContents(event.currentTarget)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }

    const handleDoubleClick = params => {
      navigator.clipboard.writeText(params.target.innerText).then(() => {
        setTooltipOpen(true)
        setTimeout(() => setTooltipOpen(false), 500)
      })
    }

    return (
      <>
        {tooltipOpen && <Box className={'copiedTooltip'}>Copied!</Box>}
        <Box
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className={`fieldWrapper ${!params.colDef?.wrapText ? 'nowrap' : ''}`}
        >
          {params.value}
        </Box>
      </>
    )
  }

  const containerWidth = gridRef?.current?.offsetWidth - 2

  const totalFixedColumnWidth =
    filteredColumns
      .filter(col => col?.width !== undefined && col.type !== 'checkbox')
      ?.reduce((sum, col) => sum + col.width, 0) +
    (filteredColumns?.some(column => column.field === 'actions') ? 100 : 0)

  const additionalWidth =
    totalFixedColumnWidth > 0 && filteredColumns?.length > 0 && containerWidth > totalFixedColumnWidth
      ? (containerWidth - totalFixedColumnWidth) / filteredColumns?.length
      : 0

  const IndentedCellRenderer = props => {
    const { data, value } = props
    const indent = data.level * 20
    const isParent = data.level === 0

    const arrow = data.hasChildren ? (data.isExpanded ? '▼' : '▶') : ''

    if (!collabsable) {
      return <div style={{ paddingLeft: indent }}>{value}</div>
    }

    return (
      <div
        style={{ paddingLeft: indent, cursor: isParent && data.hasChildren ? 'pointer' : 'default' }}
        onClick={() => handleRowClick(data)}
      >
        {arrow} {value}
      </div>
    )
  }

  const handleRowClick = params => {
    props.fullRowData.current = props?.fullRowData.current.map(row => {
      if (row?.[props?.field] === params?.[props?.field] && row.hasChildren) {
        return { ...row, isExpanded: !row.isExpanded }
      }

      return row
    })

    const updatedVisibleRows = []

    function addWithChildren(parentRow) {
      updatedVisibleRows.push(parentRow)
      if (parentRow.isExpanded) {
        const children = props?.fullRowData.current.filter(child => child.parent === parentRow?.[props?.field])
        children.forEach(child => addWithChildren(child))
      }
    }

    props?.fullRowData.current.filter(row => row.level === 0).forEach(root => addWithChildren(root))

    props?.setRowData(updatedVisibleRows)
  }

  const imageRenderer =
    column =>
    ({ data }) => {
      const imageUrl = data?.[column.field]

      const image =
        imageUrl
          ? imageUrl
          : require('@argus/shared-ui/src/components/images/emptyPhoto.jpg')

      return <img src={image?.default?.src||image} alt='' width={rowHeightImage} />
    }

  const columnDefs = [
    ...(showCheckboxColumn
      ? [
          {
            headerName: '',
            field: 'checked',
            flex: checkboxFlex,
            width: 70,
            cellRenderer: checkboxCellRenderer,
            headerComponent: params =>
              rowSelection !== 'single' &&
              showSelectAll && (
                <Checkbox
                  checked={checked}
                  disabled={props?.disableCheckBox}
                  onChange={e => {
                    e.preventDefault()
                    e.stopPropagation()

                    const colId = params.column.getColId()
                    params.api.ensureColumnVisible(colId)

                    const root = params.api.getGui && params.api.getGui()
                    const headerRoot = root ? root.querySelector('.ag-header') : document.querySelector('.ag-header')
                    const cell = headerRoot && headerRoot.querySelector('.ag-header-cell[col-id="' + colId + '"]')
                    const focusable = cell && (cell.querySelector('.ag-focus-managed') || cell)
                    focusable && focusable.focus && focusable.focus()
                    selectAll(params, e)
                  }}
                  className={'fullSizeCheckbox'}
                />
              ),
            suppressMenu: true
          }
        ]
      : []),
    ...filteredColumns.map(column => ({
      ...column,
      width: column.width + (column?.type !== 'checkbox' ? additionalWidth : 0),
      flex: column.flex,
      sort: column.sort || '',
      cellRenderer:
        column.type === 'image'
          ? imageRenderer(column)
          : column.isTree
          ? IndentedCellRenderer
          : column.cellRenderer
          ? column.cellRenderer
          : FieldWrapper
    }))
  ]

  if (props?.onEdit || props?.onDelete) {
    const deleteBtnVisible = maxAccess
      ? props?.onDelete && maxAccess[accessMap[TrxType.DEL]]
      : props?.onDelete
      ? true
      : false

    if (!columnDefs?.some(column => column.field === 'actions'))
      columnDefs?.push({
        field: 'actions',
        headerName: '',
        width: 100,
        cellRenderer: params => {
          const { data } = params
          const isStatus3 = data.status === 3
          const isStatusCanceled = data.status === -1
          const isWIP = data.wip === 2

          return (
            <Box className={'actionsBox'}>
              {props?.onEdit && (!props?.actionCondition || props?.actionCondition(data, 'edit')) && (
                <IconButton
                  size='small'
                  onClick={e => {
                    props?.onEdit(data)
                  }}
                  className={'actionIconButton'}
                >
                  <Image src={editIcon} alt='Edit' className={'actionIcon'} />
                </IconButton>
              )}

              {!globalStatus && deleteBtnVisible && (
                <IconButton
                  size='small'
                  onClick={e => {
                    if (props.deleteConfirmationType == 'strict') {
                      openDeleteConfirmation(data)
                    } else {
                      openDelete(data)
                    }
                  }}
                  color='error'
                  className={'actionIconButton'}
                >
                  <Image src={deleteIcon} alt={platformLabels.Delete} className={'actionIcon'} />
                </IconButton>
              )}
              {globalStatus &&
                !isStatus3 &&
                !isStatusCanceled &&
                deleteBtnVisible &&
                !isWIP &&
                (!props?.actionCondition || props?.actionCondition(data, 'delete')) && (
                  <IconButton
                    size='small'
                    onClick={e => {
                      if (props?.deleteConfirmationType == 'strict') {
                        openDeleteConfirmation(data)
                      } else {
                        openDelete(data)
                      }
                    }}
                    color='error'
                    className={'actionIconButton'}
                  >
                    <Image src={deleteIcon} alt={platformLabels.Delete} className={'actionIcon'} />
                  </IconButton>
                )}
            </Box>
          )
        }
      })
  }

  const gridOptions = {
    rowClassRules: {
      'even-row': params => params.node.rowIndex % 2 === 0
    }
  }

  const height = gridData?.list?.length * 35 + 40 + 40

  const tableName =
    name && name !== 'table' ? `${name}.${props?.maxAccess?.record?.resourceId}` : props?.maxAccess?.record?.resourceId

  const { data: tableSettings, refetch: invalidate } = useQuery({
    queryKey: [tableName],
    queryFn: () => getFromDB(storeName, tableName),
    enabled: !!tableName
  })

  const onColumnMoved = params => {
    if (params.columnApi && tableName && params.source != 'gridOptionsChanged') {
      const columnState = params.columnApi.getColumnState()
      saveToDB(storeName, tableName, columnState)

      invalidate()
    }
  }

  const onColumnResized = params => {
    if (tableName && params?.source === 'uiColumnResized') {
      const columnState = params.columnApi.getColumnState()

      saveToDB(storeName, tableName, columnState)
      invalidate()
    }
  }

  const onSortChanged = params => {
    if (params.columnApi && tableName && params.source == 'uiColumnSorted') {
      const columnState = params.columnApi.getColumnState()

      saveToDB(storeName, tableName, columnState)
      invalidate()
    }
  }

  const onReset = async () => {
    await deleteFromDB(storeName, tableName)
    invalidate()
  }

  const totalWidth = tableSettings?.reduce((acc, col) => {
    const width = parseFloat(col.width) || 0

    return acc + width
  }, 0)

  const updatedColumns = tableSettings
    ? columnDefs.map(({ flex, ...col }, index) => {
        const savedCol = tableSettings?.find(c => c.colId === col?.field)
        const indexSort = tableSettings?.findIndex(c => c.colId === col?.field)

        const lastColumn = tableSettings?.length === indexSort + 1

        return {
          ...col,
          width: savedCol?.width ?? 120,
          flex: null,
          sortColumn: lastColumn ? columnDefs?.length + 1 : indexSort > -1 ? indexSort : index,
          sort: savedCol?.sort ?? col?.sort
        }
      })
    : columnDefs

  const finalColumns = updatedColumns?.sort((a, b) => {
    return (a.sortColumn ?? 0) - (b.sortColumn ?? 0)
  })

  const hoverTimeoutRef = useRef(null)

  const handleMouseEnter = () => {
    if (!pagination)
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredTable(true)
      }, 600)
  }

  const handleMouseLeave = () => {
    if (!pagination) {
      clearTimeout(hoverTimeoutRef.current)
      setHoveredTable(false)
    }
  }

  const hasImageColumn = props?.columns?.some(col => col.type === 'image')

  return (
    <VertLayout>
      <Grow>
        <Box
          ref={gridRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={[
            'ag-theme-alpine',
            'agGridContainer',
            !props.maxHeight && !props.height ? 'agGridFlex' : ''
          ].join(' ')}
          sx={{
            height: props?.height || '100%',
            maxHeight: props?.maxHeight || 'none',
            minHeight: 0
          }}
        
        >
          {hoveredTable && !pagination && (
            <Box className={'hoverReset'}>
              <IconButton size='small' onClick={onReset}>
                <CachedIcon fontSize='small' />
              </IconButton>
            </Box>
          )}
          <AgGridReact
            rowData={(paginationType === 'api' ? props?.gridData?.list : gridData?.list) || []}
            enableClipboard={true}
            enableRangeSelection={true}
            columnDefs={finalColumns}
            domLayout={domLayout}
            {...(hasRowId && {
              getRowId: params => params?.data?.id
            })}
            pagination={false}
            paginationPageSize={pageSize}
            rowSelection={'single'}
            suppressAggFuncInHeader={true}
            suppressDragLeaveHidesColumns={true}
            rowHeight={hasImageColumn ? rowHeightImage : rowHeight}
            onFirstDataRendered={onFirstDataRendered}
            gridOptions={gridOptions}
            rowDragManaged={rowDragManaged}
            onRowDragEnd={onRowDragEnd}
            onColumnMoved={onColumnMoved}
            onColumnResized={onColumnResized}
            onSortChanged={onSortChanged}
            enableRtl={languageId === 2}
          />
        </Box>
      </Grow>

      {pagination && (
        <Fixed>
          <CustomPagination />
        </Fixed>
      )}

      <style jsx global>{`
        .agGridContainer {
            position: relative;
            width: 100%;
            height: auto;
            max-height: none;
            --ag-font-size: 10.5px;
          }

          .agGridFlex {
            flex: 1 1 auto;
          }

          .hoverReset {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 9999;
            box-shadow: var(--shadow-3, 0 1px 2px rgba(0, 0, 0, 0.15));
            border-radius: 4px;
            background: #fff;
          }

          .paginationWrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 6px;
          }

          .paginationBar {
            flex: 1 1 auto;
            min-width: 0;
            background-color: #fff;
            font-size: 0.8rem;
            padding: 1px 5px;
            display: flex;
            align-items: center;
            gap: 4px;
            height: 30px;
            line-height: 1;
          }

          .pageTextField {
            padding: 0;
            width: 70px;
          }

          .pageTextField :global(.MuiOutlinedInput-root),
          .pageTextField :global(.MuiInputBase-root) {
            height: 22px;
            min-height: 22px;
            font-size: 0.78rem;
          }

          .pageTextField :global(.MuiOutlinedInput-input),
          .pageTextField :global(.MuiInputBase-input) {
            padding: 1px 5px;
          }

          .actionsBox {
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
            gap: 4px;
          }

          .actionIconButton {
            padding: 0;
            width: 22px;
            height: 22px;
            min-width: 0;
          }

          .actionIcon {
            width: 16px;
            height: 16px;
          }

          .fullSizeCheckbox {
            width: 100% !important;
            height: 100% !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .agGridContainer :global(.MuiCheckbox-root) {
            width: 100% !important;
            height: 100% !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .agGridContainer :global(.MuiCheckbox-root .MuiSvgIcon-root) {
            font-size: 20px !important;
          }

          .pointerNone {
            pointer-events: none;
          }

          .fieldWrapper {
            user-select: text;
            cursor: pointer;
            width: 100%;
          }

          .fieldWrapper::selection {
            background: none !important;
            color: inherit;
          }

          .nowrap{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

          }

          .copiedTooltip {
            z-index: 1000;
            position: fixed;
            top: -40px;
            background-color: #000;
            color: #fff;
            padding: 1px 3px;
            border-radius: 5px;
          }

          .colorComboWrapper {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .colorSwatch {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 1px solid #ccc;
          }

          .agGridContainer :global(.ag-header),
          .agGridContainer :global(.ag-header-cell) {
            height: 32px !important;
            min-height: 32px !important;
          }

          .agGridContainer :global(.ag-header-cell-text),
          .agGridContainer :global(.ag-cell) {
            font-size: var(--ag-font-size);
          }

          .agGridContainer :global(.ag-cell) {
            border-right: 1px solid #d0d0d0 !important;
          }

          .agGridContainer :global(.ag-cell .MuiBox-root) {
            padding: 0 !important;
          }

          .paginationBar :global(.MuiIconButton-root) {
            padding: 0;
            width: 20px;
            height: 20px;
            min-width: 0;
          }

          .paginationBar :global(.MuiSvgIcon-root) {
            font-size: 20px;
            line-height: 1;
          }

          @media (min-width: 1025px) and (max-width: 1600px) {
            .agGridContainer:global(.ag-theme-alpine) {
              --ag-font-size: 12px;
            }

          }

          @media (max-width: 1366px) {
            .agGridContainer:global(.ag-theme-alpine) {
              --ag-cell-horizontal-padding: clamp(2px, 0.55vw, 8px);
              --ag-header-cell-horizontal-padding: clamp(2px, 0.55vw, 8px);
            }

            .agGridContainer :global(.ag-header-cell),
            .agGridContainer :global(.ag-header-cell-label) {
              padding-left: var(--ag-header-cell-horizontal-padding) !important;
              padding-right: var(--ag-header-cell-horizontal-padding) !important;
            }

            .agGridContainer :global(.ag-cell) {
              padding-left: var(--ag-cell-horizontal-padding) !important;
              padding-right: var(--ag-cell-horizontal-padding) !important;
            }
          }

          @media (max-width: 1024px) {
            .agGridContainer:global(.ag-theme-alpine) {
              --ag-font-size: 9.2px;
              --ag-cell-horizontal-padding: clamp(1px, 0.25vw, 6px);
              --ag-header-cell-horizontal-padding: clamp(1px, 0.25vw, 6px);
            }
          }

          @media (max-width: 768px) {

            .agGridContainer:global(.ag-theme-alpine) {
              --ag-font-size: 8.9px;
            }
          }

          @media (max-width: 600px) {
            .agGridContainer:global(.ag-theme-alpine) {
              --ag-font-size: 8.5px;
            }
          }

          @media (max-width: 480px) {
            .agGridContainer:global(.ag-theme-alpine) {
              --ag-font-size: 8.2px;
            }
          }

          @media (max-width: 375px) {
            .agGridContainer:global(.ag-theme-alpine) {
              --ag-font-size: 8px;
            }
          }
      `}</style>
    </VertLayout>
  )
}

export default Table
