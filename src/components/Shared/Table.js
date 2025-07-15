import React, { useContext, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, IconButton, TextField } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import Image from 'next/image'
import editIcon from '../../../public/images/TableIcons/edit.png'
import { useState } from 'react'
import { useEffect } from 'react'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LastPageIcon from '@mui/icons-material/LastPage'
import RefreshIcon from '@mui/icons-material/Refresh'
import { ControlContext } from 'src/providers/ControlContext'
import { AuthContext } from 'src/providers/AuthContext'
import { TrxType } from 'src/resources/AccessLevels'
import deleteIcon from '../../../public/images/TableIcons/delete.png'
import { useWindow } from 'src/windows'
import DeleteDialog from './DeleteDialog'
import StrictDeleteConfirmation from './StrictDeleteConfirmation'
import { HIDDEN, accessLevel } from 'src/services/api/maxAccess'
import { formatDateDefault, getTimeInTimeZone, formatDateTimeDefault } from 'src/lib/date-helper'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import { Fixed } from './Layouts/Fixed'
import { useQuery } from '@tanstack/react-query'
import CachedIcon from '@mui/icons-material/Cached'
import { getFromDB, saveToDB, deleteRowDB } from 'src/lib/indexDB'

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
  const maxAccess = props?.maxAccess && props?.maxAccess.record.maxAccess
  const columnsAccess = props?.maxAccess && props?.maxAccess.record.controls
  const { stack } = useWindow()
  const [checked, setChecked] = useState(false)
  const [focus, setFocus] = useState(false)
  const hasRowId = gridData?.list?.[0]?.id
  const storeName = 'tableSettings'
  const gridRef = useRef(null)
  const [hoveredTable, setHoveredTable] = useState(false)

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
          valueGetter: ({ data }) => formatDateDefault(data?.[col.field]),
          comparator: dateComparator,
          sortable: !disableSorting
        }
      }
      if (col.type === 'dateTime') {
        return {
          ...col,
          valueGetter: ({ data }) => data?.[col.field] && formatDateTimeDefault(data?.[col.field], col?.dateFormat),
          comparator: dateComparator,
          sortable: !disableSorting
        }
      }
      if (col.type === 'number' || col?.type?.field === 'number') {
        return {
          ...col,
          valueGetter: ({ data }) => getFormattedNumber(data?.[col.field], col.type?.decimal, col.type?.round),
          cellStyle: { textAlign: 'right' },
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
                style={col.editable ? {} : { pointerEvents: 'none' }}
              />
            )
          }
        }
      }

      return {
        ...col,
        sortable: !disableSorting
      }
    })

  function dateComparator(date1, date2) {
    var date1Number = _dateTimeToNum(date1)
    var date2Number = _dateTimeToNum(date2)
    if (date1Number === null && date2Number === null) return 0
    if (date1Number === null) return -1
    if (date2Number === null) return 1

    return date1Number - date2Number
  }

  function _dateTimeToNum(dateTime) {
    if (!dateTime || dateTime.length < 10) return null
    let [date, time = '00:00', meridian] = dateTime.split(/[\s:]+/)
    let day = date.substring(0, 2)
    let month = date.substring(3, 5)
    let year = date.substring(6, 10)
    let hours = 0
    let minutes = 0
    if (time.length === 2) {
      hours = parseInt(time, 10)
      minutes = parseInt(dateTime.substring(14, 16), 10) || 0
      if (meridian === 'PM' && hours !== 12) hours += 12
      else if (meridian === 'AM' && hours === 12) hours = 0
    }

    return (
      parseInt(year, 10) * 100000000 + parseInt(month, 10) * 1000000 + parseInt(day, 10) * 10000 + hours * 100 + minutes
    )
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
            sx={{
              px: 2,
              p: 1,
              width: '80px',
              '& .MuiInputBase-root': {
                height: '30px'
              }
            }}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: '#fff',
                borderTop: '1px solid #ccc',
                fontSize: '0.9rem',
                bottom: 0
              }}
            >
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
              <IconButton onClick={onReset}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box
                sx={{
                  width: '100%',
                  backgroundColor: '#fff',
                  borderTop: '1px solid #ccc',
                  fontSize: '0.9rem',
                  bottom: 0
                }}
              >
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
      Component: StrictDeleteConfirmation,
      props: {
        action() {
          props?.onDelete(obj)
        }
      },
      refresh: false
    })
  }

  const checkboxCellRenderer = params => {
    return (
      <Checkbox
        sx={{
          width: '100%',
          height: '100%'
        }}
        checked={params.value}
        disabled={props?.disable && props?.disable(params?.data)}
        onChange={e => {
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
      <Box>
        {tooltipOpen && (
          <Box
            sx={{
              zIndex: 1000,
              position: 'fixed',
              top: '-40px',
              backgroundColor: 'black',
              color: 'white',
              paddingY: '1px',
              paddingX: '3px',
              borderRadius: '5px'
            }}
          >
            Copied!
          </Box>
        )}
        <Box
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          sx={{
            userSelect: 'text',
            cursor: 'pointer',
            height: '50%',
            width: '100%',
            '&::selection': {
              backgroundColor: 'none !important',
              color: 'inherit'
            },
            '&:focus': {
              outline: 'none'
            },
            ...(!params.colDef?.wrapText && {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            })
          }}
        >
          {params.value}
        </Box>
      </Box>
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

    const arrow = isParent && data.hasChildren ? (data.isExpanded ? '▼' : '▶') : ''

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
      if (row?.[props?.field] === params?.[props?.field] && row.level === 0) {
        return { ...row, isExpanded: !row.isExpanded }
      }

      return row
    })

    const updatedVisibleRows = []
    for (const row of props?.fullRowData.current) {
      if (row.level === 0) {
        updatedVisibleRows.push(row)
        if (row.isExpanded) {
          const children = props?.fullRowData.current.filter(child => child.parent === row?.[props?.field])
          updatedVisibleRows.push(...children)
        }
      }
    }

    props?.setRowData(updatedVisibleRows)
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
                  onChange={e => selectAll(params, e)}
                  sx={{
                    width: '100%',
                    height: '100%'
                  }}
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
      cellRenderer: column.isTree ? IndentedCellRenderer : column.cellRenderer ? column.cellRenderer : FieldWrapper
    }))
  ]

  if (props?.onEdit || props?.onDelete) {
    const deleteBtnVisible = maxAccess ? props?.onDelete && maxAccess > TrxType.EDIT : props?.onDelete ? true : false

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
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              {props?.onEdit && (
                <IconButton
                  size='small'
                  onClick={e => {
                    props?.onEdit(data)
                  }}
                >
                  <Image src={editIcon} alt='Edit' width={18} height={18} />
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
                >
                  <Image src={deleteIcon} alt={platformLabels.Delete} width={18} height={18} />
                </IconButton>
              )}
              {globalStatus && !isStatus3 && !isStatusCanceled && deleteBtnVisible && !isWIP && (
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
                >
                  <Image src={deleteIcon} alt={platformLabels.Delete} width={18} height={18} />
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
    await deleteRowDB(storeName, tableName)
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

  return (
    <VertLayout>
      <Grow>
        <Box
          ref={gridRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className='ag-theme-alpine'
          style={{
            flex: !props.maxHeight && !props.height && 1,
            width: '1000px !important',
            height: props?.maxHeight ? height : props?.height || 'auto',
            maxHeight: props?.maxHeight || 'auto',
            position: 'relative'
          }}
          sx={{
            '.ag-header': {
              height: '40px !important',
              minHeight: '40px !important'
            },
            '.ag-header-cell': {
              height: '40px !important',
              minHeight: '40px !important'
            },
            '.ag-cell': {
              borderRight: '1px solid #d0d0d0 !important'
            },
            '.ag-cell .MuiBox-root': {
              padding: '0px !important'
            }
          }}
        >
          {hoveredTable && !pagination && (
            <Box position='absolute' top={0} right={0} zIndex={9999} boxShadow={3} borderRadius={1} bgcolor='white'>
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
            {...(hasRowId && {
              getRowId: params => params?.data?.id
            })}
            pagination={false}
            paginationPageSize={pageSize}
            rowSelection={'single'}
            suppressAggFuncInHeader={true}
            suppressDragLeaveHidesColumns={true}
            rowHeight={35}
            onFirstDataRendered={onFirstDataRendered}
            gridOptions={gridOptions}
            rowDragManaged={rowDragManaged}
            onRowDragEnd={onRowDragEnd}
            onColumnMoved={onColumnMoved}
            onColumnResized={onColumnResized}
            onSortChanged={onSortChanged}
          />
        </Box>
      </Grow>
      {pagination && (
        <Fixed>
          <CustomPagination />
        </Fixed>
      )}
    </VertLayout>
  )
}

export default Table
