import { useState } from 'react'
import PropTypes from 'prop-types'

// ** MUI Imports
import {
    Box,
    IconButton,
    LinearProgress
} from '@mui/material'
import {
    DataGrid,
    gridClasses,
} from '@mui/x-data-grid'
import { alpha, styled } from '@mui/material/styles'

// ** Icons
import Icon from 'src/@core/components/icon'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import LastPageIcon from '@mui/icons-material/LastPage'

// ** Custom Imports
import DeleteDialog from './DeleteDialog'

const ODD_OPACITY = 0.2

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    borderRadius: 0,
    borderTop: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
    '& .MuiDataGrid-columnsContainer': {
        backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d',
    },
    '& .MuiDataGrid-iconSeparator': {
        display: 'none',
    },
    '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
        borderRight: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
    },
    '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
        borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#cccccc' : '#303030'}`,
    },
    '& .MuiDataGrid-cell': {
        color:
            theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.65)',
    },
    '& .MuiPaginationItem-root': {
        borderRadius: 0,
    },
    [`& .${gridClasses.row}.even`]: {
        backgroundColor: theme.palette.grey[200],
        '&:hover, &.Mui-hovered': {
            backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            },
        },
        '&.Mui-selected': {
            backgroundColor: alpha(
                theme.palette.primary.main,
                ODD_OPACITY + theme.palette.action.selectedOpacity,
            ),
            '&:hover, &.Mui-hovered': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    ODD_OPACITY +
                    theme.palette.action.selectedOpacity +
                    theme.palette.action.hoverOpacity,
                ),
                '@media (hover: none)': {
                    backgroundColor: alpha(
                        theme.palette.primary.main,
                        ODD_OPACITY + theme.palette.action.selectedOpacity,
                    ),
                },
            },
        },
    },
}))

const TableContainer = styled(Box)({
    // height: '600px', // Change this value as needed
    // flex: 1,
    // overflow: 'auto', // Enable scrolling within the container
    position: 'relative',
})

const ScrollableTable = styled('div')({
    overflowY: 'auto', // Enable vertical scrolling
    maxHeight: '100%', // Limit the maximum height to the container's height
})

const PaginationContainer = styled(Box)({
    width: '100%',
    position: 'fixed',
    bottom: '0',
    backgroundColor: '#fff',
    borderTop: '1px solid #ccc',
})

const Table = props => {
    const gridData = props.gridData
    const api = props.api
    const startAt = gridData._startAt
    const pageSize = 30
    const [deleteDialogOpen, setDeleteDialogOpen] = useState([false, {}])

    const getRowId = (row) => {
        return props.rowId.map(field => row[field]).join('-')
    }

    const CustomPagination = () => {
        const page = Math.ceil(startAt === 0 ? 1 : (startAt + 1) / pageSize)
        const pageCount = Math.ceil(gridData.count / pageSize)

        const incrementPage = () => {
            if (page < pageCount) {
                console.log((page + 1) * pageSize)
                api({ _startAt: page * pageSize, _pageSize: pageSize })
            }
        }

        const decrementPage = () => {
            if (page > 1) {
                console.log((page - 2) * pageSize)
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
                {/* <Pagination
                    color='primary'
                    variant='outlined'
                    shape='rounded'
                    page={page + 1}
                    count={pageCount}
                    renderItem={props2 => <PaginationItem {...props2} disableRipple />}
                    onChange={(event, value) => {
                        console.log((value * 30) + 1)
                        apiRef.current.setPage(value - 1)
                    }}
                    style={{
                        width: '100%',
                        position: 'absolute',
                        bottom: '0',
                        backgroundColor: '#fff',
                    }}
                /> */}
            </PaginationContainer>
        )
    }

    const columns = props.columns

    columns.push({
        field: 'action',
        headerName: 'ACTIONS',
        width: 100,
        sortable: false,
        renderCell: params => {
            return (
                <>
                    {props.onEdit &&
                        <IconButton
                            size='small'
                            onClick={() => props.onEdit(params.row)}
                        >
                            <Icon icon='mdi:application-edit-outline' fontSize={18} />
                        </IconButton>
                    }
                    {props.onDelete &&
                        <IconButton
                            size='small'
                            onClick={() => setDeleteDialogOpen([true, params.row])}
                            color='error'
                        >
                            <Icon icon='mdi:delete-forever' fontSize={18} />
                        </IconButton>
                    }
                </>
            )
        }
    })

    return (
        <>
            <TableContainer sx={props.style ? props.style : { pt: 2 }}>
                {/* <ScrollableTable> */}
                <StripedDataGrid
                    rows={gridData.list || []}
                    columns={columns}
                    autoHeight
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 30,
                            },
                        },
                    }}
                    components={{
                        LoadingOverlay: LinearProgress,
                        Pagination: CustomPagination
                    }}
                    loading={props.isLoading}
                    getRowId={getRowId}
                    disableRowSelectionOnClick
                    disableColumnMenu
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                    }
                    {...props}
                />
                {/* </ScrollableTable> */}
                {/* <PaginationContainer>
                    <CustomPagination />
                </PaginationContainer> */}
            </TableContainer>
            <DeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen([false, {}])}
                onConfirm={(obj) => {
                    setDeleteDialogOpen([false, {}])
                    props.onDelete(obj)
                }}
            />
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
