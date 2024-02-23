import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

// ** MUI Imports
import { Box, Stack, IconButton, LinearProgress, Checkbox, TableCell } from '@mui/material'
import { DataGrid, gridClasses } from '@mui/x-data-grid'
import { alpha, styled } from '@mui/material/styles'

// ** Icons
import Icon from 'src/@core/components/icon'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LastPageIcon from '@mui/icons-material/LastPage'
import RefreshIcon from '@mui/icons-material/Refresh'

// ** Custom Imports
import DeleteDialog from './DeleteDialog'

// ** Resources
import { ControlAccessLevel, TrxType } from 'src/resources/AccessLevels'

const ODD_OPACITY = 0.2

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  borderRadius: 0,
  borderTop: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
  borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
  '& .MuiDataGrid-main': {
    // remove overflow hidden overwise sticky does not work
    overflow: 'unset'
  },
  '& .MuiDataGrid-columnHeaders': {
    position: 'sticky'
  },
  '& .MuiDataGrid-row:last-child': {
    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`
  },
  '& .MuiDataGrid-virtualScroller': {
    // remove the space left for the header
    marginTop: '0!important'
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

const TableContainer = styled(Box)({
  // height: '600px', // Change this value as needed
  // flex: 1,
  // overflow: 'auto', // Enable scrolling within the container
  position: 'relative'
})

const PaginationContainer = styled(Box)({
  width: '100%',
  position: 'fixed',
  bottom: '0',
  backgroundColor: '#fff',
  borderTop: '1px solid #ccc'
})

const Table = ({
  pagination = true,
  paginationType = 'api',
  handleCheckedRows,
  height,
  actionColumnHeader = null,
  showCheckboxColumn = false,
  checkTitle = '',
  ...props
}) => {
  const [gridData, setGridData] = useState(props.gridData)
  const [startAt, setStartAt] = useState(0)
  const [page, setPage] = useState(1)
  const [checkedRows, setCheckedRows] = useState({})
  const [filteredRows, setFilteredRows] = useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState([false, {}])

  const pageSize = props.pageSize ? props.pageSize : 50
  const originalGridData = props.gridData && props.gridData.list && props.gridData.list
  const api = props?.api ? props?.api: props.paginationParameters
  const refetch = props?.refetch
  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
  const columnsAccess = props.maxAccess && props.maxAccess.record.controls

  const getRowId = row => {
    return props.rowId.map(field => row[field]).join('-')
  }

  const CustomPagination = () => {
    if (pagination) {
      if (paginationType === 'api' && gridData ) {
        const startAt = gridData._startAt
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
            <IconButton onClick={goToFirstPage} disabled={page === 1}>
              <FirstPageIcon />
            </IconButton>
            <IconButton onClick={decrementPage} disabled={page === 1}>
              <NavigateBeforeIcon />
            </IconButton>
            Page: {page} of {pageCount}
            <IconButton onClick={incrementPage} disabled={page === pageCount}>
              <NavigateNextIcon />
            </IconButton>
            <IconButton onClick={goToLastPage} disabled={page === pageCount}>
              <LastPageIcon />
            </IconButton>
            {api && (
              <IconButton onClick={goToFirstPage}>
                <RefreshIcon />
              </IconButton>
            )}
            Displaying Records {startAt === 0 ? 1 : startAt} -{' '}
            {totalRecords < pageSize ? totalRecords : page === pageCount ? totalRecords : startAt + pageSize} of{' '}
            {totalRecords}
          </PaginationContainer>
        )
      } else {
        if (gridData && gridData.list) {
          var _gridData = props.gridData.list
          const pageCount = Math.ceil(originalGridData.length ? originalGridData.length / pageSize : 1)
          const totalRecords = originalGridData.length

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
              const pageNumber = parseInt(originalGridData.length/pageSize)
              const start = pageSize*pageNumber
              setStartAt(start)
            }
          }

          return (
            <PaginationContainer>
              <IconButton onClick={goToFirstPage} disabled={page === 1}>
                <FirstPageIcon />
              </IconButton>
              <IconButton onClick={decrementPage} disabled={page === 1}>
                <NavigateBeforeIcon />
              </IconButton>
              Page: {page} of {pageCount}
              <IconButton onClick={incrementPage} disabled={page === pageCount}>
                <NavigateNextIcon />
              </IconButton>
              <IconButton onClick={goToLastPage} disabled={page === pageCount}>
                <LastPageIcon />
              </IconButton>
              {/* {api && ( */}
                <IconButton onClick={refetch}>
                  <RefreshIcon />
                </IconButton>
              {/* )} */}
              Displaying Records {startAt === 0 ? 1 : startAt} -{' '}
              {totalRecords < pageSize ? totalRecords : page === pageCount ? totalRecords : startAt + pageSize} of{' '}
              {totalRecords}
            </PaginationContainer>
          )
        }
      }
    } else {
      return <div></div>
    }
  }

  const columns = props.columns

  const handleCheckboxChange = row => {
    setCheckedRows(prevCheckedRows => {
      // Create a new object with all the previous checked rows
      const newCheckedRows = { ...prevCheckedRows }

      // Create the key based on the presence of seqNo
      const key = row.seqNo ? `${row.recordId}-${row.seqNo}` : row.recordId

      // Update the newCheckedRows object with the current row
      newCheckedRows[key] = row

      // Check if newCheckedRows[key] is defined and has checked property
      const filteredRows = !newCheckedRows[key]?.checked ? [newCheckedRows[key]] : []

      // Pass the entire updated rows in the callback
      handleCheckedRows(filteredRows)

      // Log the updated checkedRows after the state has been updated
      console.log('checkedRows 4 ', newCheckedRows)

      // Return the updated state for the next render
      return filteredRows
    })
  }

  const shouldRemoveColumn = column => {
    const match = columnsAccess && columnsAccess.find(item => item.controlId === column.id)

    return match && match.accessLevel === ControlAccessLevel.Hidden
  }

  const filteredColumns = columns.filter(column => !shouldRemoveColumn(column))

  if (props.onEdit || props.onDelete) {
    const deleteBtnVisible = maxAccess ? props.onDelete && maxAccess > TrxType.EDIT : props.onDelete ? true : false

    filteredColumns.push({
      field: actionColumnHeader,
      headerName: actionColumnHeader,
      width: 100,
      sortable: false,
      renderCell: params => {
        const { row } = params
        const isStatus3 = row.status === 3
        const isWIP = row.wip === 2

        return (
          <>
            {props.onEdit && (
              <IconButton size='small' onClick={() => props.onEdit(params.row)}>
                <Icon icon='mdi:application-edit-outline' fontSize={18} />
              </IconButton>
            )}
            {!isStatus3 && deleteBtnVisible && !isWIP && (
              <IconButton size='small' onClick={() => setDeleteDialogOpen([true, params.row])} color='error'>
                <Icon icon='mdi:delete-forever' fontSize={18} />
              </IconButton>
            )}
          </>
        )
      }
    })
  }

  const paginationHeight = pagination ? '41px' : '10px'
  const tableHeight = height ? `${height}px` : `calc(100vh - 48px - 48px - ${paginationHeight})`

  useEffect(() => {

    if (props.gridData && props.gridData.list && paginationType === 'client'){
       var slicedGridData = props.gridData.list.slice((page-1) * pageSize, (page) * pageSize)
       setGridData({
        ...gridData,
        list: slicedGridData
      })
    }
    if (props.gridData && props.gridData.list && paginationType === 'api'){
      setGridData( props.gridData)
   }
    if (pagination && paginationType != 'api' && props.gridData && props.gridData.list && page != 1) {
      // console.log('enter if')
      // setPage(1)
    }
    setCheckedRows([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.gridData])

  return (
    <>
      {maxAccess && maxAccess > TrxType.NOACCESS ? (
        <>
          <TableContainer
            sx={
              props.style
                ? props.style
                : {
                    zIndex: 0

                    // marginBottom: 0,
                    // pb: 0,
                    // maxHeight: tableHeight, overflow: 'auto', position: 'relative',
                  }
            }
          >
            {/* <ScrollableTable> */}
            <StripedDataGrid
              rows={gridData?.list ?  (page < 2 && paginationType === 'api') ? gridData?.list.slice(0 , 50) : gridData?.list : []}
              sx={{ minHeight: tableHeight, overflow: 'auto', position: 'relative', pb: 2 }}
              density='compact'
              components={{
                LoadingOverlay: LinearProgress,

                // Pagination: pagination ? CustomPagination : null,
                Footer: CustomPagination,
                NoRowsOverlay: () => (
                  <Stack height='100%' alignItems='center' justifyContent='center'>
                    This Screen Has No Data
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
            {/* </ScrollableTable> */}
            {/* <PaginationContainer>
                    <CustomPagination />
                </PaginationContainer> */}
          </TableContainer>
          <DeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen([false, {}])}
            onConfirm={obj => {
              setDeleteDialogOpen([false, {}])
              props.onDelete(obj)
            }}
          />
        </>
      ) : (
        'NO ACCESS'
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
