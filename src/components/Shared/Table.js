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

const Table = ({
  fetchGridData,
  paginationType = 'api',
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

  const columns = props.columns.filter(
    ({ field }) =>
      accessLevel({
        maxAccess: props.maxAccess,
        name: field
      }) !== HIDDEN
  )

  useEffect(() => {
    props?.gridData && paginationType !== 'api' && setGridData(props?.gridData)
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

  const handleCheckboxChange = row => {
    setCheckedRows(prevCheckedRows => {
      const newCheckedRows = { ...prevCheckedRows }
      const key = row.seqNo ? `${row.recordId}-${row.seqNo}` : row.recordId
      newCheckedRows[key] = row
      const filteredRows = !newCheckedRows[key]?.checked ? [newCheckedRows[key]] : []

      return filteredRows
    })
  }
  const onSelectionChanged = params => {
    const gridApi = params.api
    const selectedNodes = gridApi.getSelectedNodes()
    const selectedData = selectedNodes.map(node => node.data)
    console.log(selectedData)
    // setData(selectedData)
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
          // handleCheckedRows(updatedRows)
          console.log(params.colDef.field, checked, params.value)
          params.node.setDataValue(params.colDef.field, checked)
        }}
      />
    )
  }

  return (
    <Box className='ag-theme-alpine' style={{ flex: 1, width: '1000px !important', height: props.height || 'auto' }}>
      <AgGridReact
        rowData={paginationType === 'api' ? props?.gridData?.list : gridData?.list}
        columnDefs={[
          ...(showCheckboxColumn
            ? [
                {
                  headerName: '',
                  field: 'checked',
                  cellRenderer: checkboxCellRenderer,
                  headerCheckboxSelection: true
                }
              ]
            : []),
          ...columns
        ]}
        pagination={false}
        paginationPageSize={pageSize}
        rowSelection={'multiple'}
        suppressAggFuncInHeader={true}
        getRowClass={getRowClass}
        onSelectionChanged={setData === 'function' && onSelectionChanged}
      />
      {pagination && <CustomPagination />}
    </Box>
  )
}

export default Table
