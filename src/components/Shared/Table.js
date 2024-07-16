import React, { useContext, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { Box, IconButton, TextField } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'

import Image from 'next/image'
import editIcon from '../../../public/images/TableIcons/edit.png'
import { useState } from 'react'
import { useEffect } from 'react'
import 'ag-grid-enterprise'
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
import { formatDateDefault } from 'src/lib/date-helper'
import { getFormattedNumber } from 'src/lib/numberField-helper'

const Table = ({
  fetchGridData,
  paginationType = '',
  viewCheckButtons = false,
  showCheckboxColumn = false,
  pagination = true,
  handleCheckedRows,
  setData,
  ...props
}) => {
  const pageSize = props?.pageSize || 100
  const api = props?.api ? props?.api : props?.paginationParameters || ''
  const refetch = props?.refetch
  const [gridData, setGridData] = useState({})
  const [startAt, setStartAt] = useState(0)
  const { languageId } = useContext(AuthContext)
  const { platformLabels } = useContext(ControlContext)
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const columnsAccess = props.maxAccess && props.maxAccess.record.controls
  const { stack } = useWindow()
  const [checkedRows, setCheckedRows] = useState({})
  const [checked, setChecked] = useState(false)

  const columns = props.columns
    .filter(
      ({ field }) =>
        accessLevel({
          maxAccess: props.maxAccess,
          name: field
        }) !== HIDDEN
    )
    .map(col => {
      if (col.type === 'date') {
        return {
          ...col,
          valueGetter: ({ data }) => formatDateDefault(data?.[col.field])
        }
      }
      if (col.type === 'number') {
        return {
          ...col,
          valueGetter: ({ data }) => getFormattedNumber(data?.[col.field])
        }
      }
      return col
    })

  useEffect(() => {
    const areAllValuesTrue = props?.gridData?.list.every(item => item.checked === true)
    setChecked(areAllValuesTrue)

    props?.gridData &&
      paginationType !== 'api' &&
      pageSize &&
      setGridData({ list: pageSize ? props?.gridData?.list?.slice(0, pageSize) : props?.gridData?.list })
  }, [props?.gridData])

  const CustomPagination = () => {
    if (pagination) {
      const TextInput = ({ value, pageCount }) => {
        const jumpToPage = e => {
          const newPage = e.target.value

          if ((e.key === 'Enter' || e.keyCode === 13) && newPage > 0)
            if (paginationType === 'api') {
              api({ _startAt: (newPage - 1) * pageSize, _pageSize: pageSize })
            } else {
              var slicedGridData = props.gridData?.list.slice((newPage - 2) * pageSize, newPage * pageSize)
              setGridData({
                ...props.gridData?.list,
                list: slicedGridData
              })
              setStartAt((newPage - 2) * pageSize + pageSize)
            }
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
            autoFocus={true}
            onInput={handleInput}
            defaultValue={value}
            onKeyUp={jumpToPage}
          />
        )
      }
      if (paginationType === 'api') {
        const gridData = props.gridData
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
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#fff',
              borderTop: '1px solid #ccc',
              position: 'sticky',
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
        )
      } else {
        const gridData = props.gridData

        if (gridData && gridData?.list) {
          const originalGridData = gridData && gridData.list
          const page = Math.ceil(gridData.count ? (startAt === 0 ? 1 : (startAt + 1) / pageSize) : 1)

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
            <Box
              sx={{
                width: '100%',
                backgroundColor: '#fff',
                borderTop: '1px solid #ccc',
                position: 'fixed',
                bottom: 0
              }}
            >
              {' '}
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
              {totalRecords < pageSize ? totalRecords : page === pageCount ? totalRecords : startAt + pageSize}{' '}
              {platformLabels.Of} {totalRecords}
            </Box>
          )
        }
      }
    }
  }

  const getRowClass = params => {
    return params?.rowIndex % 2 === 0 ? 'even-row' : ''
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
    setCheckedRows(
      allNodes.reduce((acc, node) => {
        if (e.target.checked) acc[node.id] = node.data

        return acc
      }, {})
    )

    if (typeof setData === 'function') setData(allNodes.map(node => node.data))
  }

  function openDelete(obj) {
    stack({
      Component: DeleteDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => props.onDelete(obj)
      },
      width: 450,
      height: 170,
      title: platformLabels.Delete
    })
  }
  function openDeleteConfirmation(obj) {
    stack({
      Component: StrictDeleteConfirmation,
      props: {
        action() {
          props.onDelete(obj)
        }
      },
      width: 500,
      height: 300,
      title: platformLabels.DeleteConfirmation
    })
  }

  if (props.onEdit || props.onDelete || props?.popupComponent) {
    const deleteBtnVisible = maxAccess ? props.onDelete && maxAccess > TrxType.EDIT : props.onDelete ? true : false

    if (!columns?.some(column => column.field === 'actions'))
      columns?.push({
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
              {props.onEdit && (
                <IconButton
                  size='small'
                  onClick={e => {
                    props.onEdit(data)
                  }}
                >
                  <Image src={editIcon} alt='Edit' width={18} height={18} />
                </IconButton>
              )}
              {props.popupComponent && (
                <IconButton
                  size='small'
                  onClick={e => {
                    props.popupComponent(data)
                  }}
                >
                  <Image src={editIcon} alt='Edit' width={18} height={18} />
                </IconButton>
              )}
              {!isStatus3 && !isStatusCanceled && deleteBtnVisible && !isWIP && (
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
            </Box>
          )
        }
      })
  }

  const checkboxCellRenderer = params => {
    return (
      <Checkbox
        checked={params.value}
        onChange={e => {
          const checked = e.target.checked
          const updatedRows = { ...checkedRows, [params.node.id]: checked }
          setCheckedRows(updatedRows)
          params.node.setDataValue(params.colDef.field, checked)
        }}
      />
    )
  }

  const columnDefs = [
    ...(showCheckboxColumn
      ? [
          {
            headerName: '',
            field: 'checked',
            cellRenderer: checkboxCellRenderer,
            headerComponent: params => <Checkbox checked={checked} onChange={e => selectAll(params, e)} />,
            suppressMenu: true // if i want to remove menu from header
          }
        ]
      : []),
    ...columns
  ]
  console.log('columns', columns)

  return (
    <>
      <Box className='ag-theme-alpine' style={{ flex: 1, width: '1000px !important', height: props.height || 'auto' }}>
        <AgGridReact
          rowData={(paginationType === 'api' ? props?.gridData?.list : gridData?.list) || []}
          enableClipboard={true}
          enableRangeSelection={true}
          columnDefs={columnDefs}
          pagination={false}
          paginationPageSize={pageSize}
          rowSelection={'multiple'}
          suppressAggFuncInHeader={true}
          getRowClass={getRowClass}
        />
      </Box>
      {pagination && (
        <Box
          sx={{
            flexShrink: 0,
            position: 'sticky',
            bottom: 0,
            width: '100%'
          }}
        >
          <CustomPagination />
        </Box>
      )}
    </>
  )
}

export default Table
