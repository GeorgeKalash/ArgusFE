import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Stack, IconButton, LinearProgress, Checkbox, TableCell, Button } from '@mui/material'
import { DataGrid, gridClasses } from '@mui/x-data-grid'
import { alpha, styled } from '@mui/material/styles'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LastPageIcon from '@mui/icons-material/LastPage'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteDialog from './DeleteDialog'
import Image from 'next/image'
import { ControlAccessLevel, TrxType } from 'src/resources/AccessLevels'
import { HIDDEN, accessLevel } from 'src/services/api/maxAccess'
import { useWindow } from 'src/windows'
import StrictDeleteConfirmation from './StrictDeleteConfirmation'
import deleteIcon from '../../../public/images/TableIcons/delete.png'
import editIcon from '../../../public/images/TableIcons/edit.png'
import { ControlContext } from 'src/providers/ControlContext'
import { AuthContext } from 'src/providers/AuthContext'

const ODD_OPACITY = 0.2

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  borderRadius: 0,
  borderTop: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
  borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
  '& .MuiDataGrid-main': {
    overflow: 'unset'
  },
  '& .MuiDataGrid-columnHeaders': {
    position: 'sticky',
    backgroundColor: '#F5F5F5'
  },

  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: '900'
  },
  '& .MuiDataGrid-row:last-child': {
    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`
  },
  '& .MuiDataGrid-virtualScroller': {
    marginTop: '0px !important',
    overflowX: 'hidden !important'
  },
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d'
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none'
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`
  },
  '& .MuiDataGrid-cell': {
    color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.65)'
  },
  '& .MuiPaginationItem-root': {
    borderRadius: 0
  },
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent'
      }
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity
        ),
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity)
        }
      }
    }
  }
}))

const PaginationContainer = styled(Box)({
  width: '100%',
  backgroundColor: '#fff',
  borderTop: '1px solid #ccc'
})

const Table = ({
  pagination = true,
  paginationType = 'api',
  height,
  addedHeight = '0px',
  actionColumnHeader = '',
  showCheckboxColumn = false,
  checkTitle = '',
  viewCheckButtons = false,
  ChangeCheckedRow,
  ...props
}) => {
  const { stack } = useWindow()

  const [gridData, setGridData] = useState(props.gridData)
  const { platformLabels } = useContext(ControlContext)
  const { languageId } = useContext(AuthContext)
  const [startAt, setStartAt] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = props.pageSize ? props.pageSize : 50
  const originalGridData = props.gridData && props.gridData.list && props.gridData.list
  const api = props?.api ? props?.api : props.paginationParameters
  const refetch = props?.refetch
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const columnsAccess = props.maxAccess && props.maxAccess.record.controls

  const getRowId = row => {
    return props.rowId.map(field => row[field]).join('-')
  }

  const CustomPagination = () => {
    if (pagination) {
      if (paginationType === 'api' && gridData) {
        const startAt = gridData._startAt ?? 0
        const totalRecords = gridData?.count ? gridData?.count : 0
        const page = Math.ceil(gridData.count ? (startAt === 0 ? 1 : (startAt + 1) / pageSize) : 1)
        const pageCount = Math.ceil(gridData.count ? gridData.count / pageSize : 1)

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
          <PaginationContainer>
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
            {platformLabels.Page} {page} {platformLabels.Of} {pageCount}
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
          </PaginationContainer>
        )
      } else {
        if (gridData && gridData.list) {
          var _gridData = props.gridData?.list
          const pageCount = Math.ceil(originalGridData?.length ? originalGridData?.length / pageSize : 1)
          const totalRecords = originalGridData?.length

          const incrementPage = () => {
            if (page < pageCount) {
              var slicedGridData = _gridData.slice(page * pageSize, (page + 1) * pageSize)
              setGridData({
                ...gridData,
                list: slicedGridData
              })
              setPage(page + 1)
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
              setPage(page - 1)
              setStartAt(startAt - pageSize)
            }
          }

          const goToFirstPage = () => {
            if (page > 1) {
              var slicedGridData = _gridData.slice(
                0,
                originalGridData.length > pageSize ? pageSize : originalGridData.length
              )
              setGridData({
                ...gridData,
                list: slicedGridData
              })
              setPage(1)
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
              setPage(pageCount)
              const pageNumber = parseInt(originalGridData.length / pageSize)
              const start = pageSize * pageNumber
              setStartAt(start)
            }
          }

          return (
            <PaginationContainer>
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
              {platformLabels.Page} {page} {platformLabels.Of} {pageCount}
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
            </PaginationContainer>
          )
        }
      }
    } else {
      return <div></div>
    }
  }

  const columns = props.columns.filter(
    ({ field }) =>
      accessLevel({
        maxAccess: props.maxAccess,
        name: field
      }) !== HIDDEN
  )

  const shouldViewButtons = !viewCheckButtons ? 'none' : ''

  const handleCheckboxChange = row => {
    if (ChangeCheckedRow)
      ChangeCheckedRow(prevCheckedRows => {
        const newCheckedRows = { ...prevCheckedRows }
        const key = row.seqNo ? `${row.recordId}-${row.seqNo}` : row.recordId
        newCheckedRows[key] = row
        const filteredRows = !newCheckedRows[key]?.checked ? [newCheckedRows[key]] : []

        return filteredRows
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

  const shouldRemoveColumn = column => {
    const match = columnsAccess && columnsAccess.find(item => item.controlId === column.id)

    return match && match.accessLevel === ControlAccessLevel.Hidden
  }
  const filteredColumns = columns.filter(column => !shouldRemoveColumn(column))
  if (props.onEdit || props.onDelete || props.popupComponent) {
    const deleteBtnVisible = maxAccess ? props.onDelete && maxAccess > TrxType.EDIT : props.onDelete ? true : false

    filteredColumns.push({
      field: actionColumnHeader,
      headerName: actionColumnHeader,
      width: 100,
      sortable: false,
      renderCell: params => {
        const { row } = params
        const isStatus3 = row.status === 3
        const isStatus4 = row.status === 4
        const isStatusCanceled = row.status === -1
        const isWIP = row.wip === 2

        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            {props.onEdit && (
              <IconButton
                size='small'
                onClick={e => {
                  props.onEdit(params.row)
                }}
              >
                <Image src={editIcon} alt='Edit' width={18} height={18} />
              </IconButton>
            )}
            {props.popupComponent && (
              <IconButton
                size='small'
                onClick={e => {
                  props.popupComponent(params.row)
                }}
              >
                <Image src={editIcon} alt='Edit' width={18} height={18} />
              </IconButton>
            )}
            {!isStatus3 && !isStatus4 && !isStatusCanceled && deleteBtnVisible && !isWIP && (
              <IconButton
                size='small'
                onClick={e => {
                  if (props.deleteConfirmationType == 'strict') {
                    openDeleteConfirmation(params.row)
                  } else {
                    openDelete(params.row)
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

  const handleCheckAll = () => {
    const updatedRowGridData = gridData.list.map(row => ({
      ...row,
      checked: true
    }))

    ChangeCheckedRow(prevGridData => ({
      ...prevGridData,
      list: updatedRowGridData
    }))
  }

  const handleUncheckAll = () => {
    const updatedRowGridData = gridData.list.map(row => ({
      ...row,
      checked: false
    }))

    ChangeCheckedRow(prevGridData => ({
      ...prevGridData,
      list: updatedRowGridData
    }))
  }

  useEffect(() => {
    if (props.gridData && props.gridData.list && paginationType === 'client') {
      var slicedGridData = props.gridData.list.slice((page - 1) * pageSize, page * pageSize)
      setGridData({
        ...gridData,
        list: slicedGridData
      })
    }
    if (props.gridData && props.gridData.list && paginationType === 'api') {
      setGridData(props.gridData)
    }
  }, [props.gridData])

  return (
    <>
      {maxAccess && maxAccess > TrxType.NOACCESS ? (
        <>
          <Stack direction='row' spacing={2} marginBottom={2}>
            <Button variant='contained' color='primary' onClick={handleCheckAll} style={{ display: shouldViewButtons }}>
              {platformLabels.CheckAll}
            </Button>
            <Button
              variant='contained'
              color='secondary'
              onClick={handleUncheckAll}
              style={{ display: shouldViewButtons }}
            >
              {platformLabels.UncheckAll}
            </Button>
          </Stack>
          <StripedDataGrid
            rows={
              gridData?.list
                ? page < 2 && paginationType === 'api'
                  ? gridData?.list.slice(0, 50)
                  : gridData?.list
                : []
            }
            sx={{
              '& .MuiDataGrid-overlayWrapperInner': {
                height: '300px !important'
              },
              overflow: 'auto',
              position: 'relative',
              display: 'flex',
              flex: 1,
              zIndex: '0 !important',
              marginBottom: pagination ? 0 : 5,
              height: height ? height : 'auto'
            }}
            density='compact'
            components={{
              LoadingOverlay: LinearProgress,
              Footer: CustomPagination,
              NoRowsOverlay: () => (
                <Stack height='100%' alignItems='center' justifyContent='center'>
                  {platformLabels.NoDataScreen}
                </Stack>
              )
            }}
            loading={props.isLoading}
            getRowId={getRowId}
            disableRowSelectionOnClick
            disableColumnMenu
            getRowClassName={params => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
            {...props}
            columns={[
              ...(showCheckboxColumn
                ? [
                    {
                      field: 'checkbox',
                      headerName: checkTitle,
                      renderCell: params => (
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={params.row.checked || false}
                            onChange={() => {
                              handleCheckboxChange(params.row)
                              params.row.checked = !params.row.checked
                            }}
                          />
                        </TableCell>
                      )
                    }
                  ]
                : []),
              ...filteredColumns
            ]}
          />
        </>
      ) : (
        platformLabels.NoAccess
      )}
    </>
  )
}

export default Table

Table.propTypes = {
  isLoading: PropTypes.bool,
  columns: PropTypes.array,
  selectedRow: PropTypes.array,
  setselectedRow: PropTypes.func,
  onSelectionChange: PropTypes.func
}
