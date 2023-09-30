import LinearProgress from '@mui/material/LinearProgress'
import PropTypes from 'prop-types'
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector, gridClasses } from '@mui/x-data-grid'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
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
}));

const Table = props => {
    const getRowId = (row) => {
        return row[props.rowId]
    }

    function CustomPagination() {
        const apiRef = useGridApiContext()
        const page = useGridSelector(apiRef, gridPageSelector)
        const pageCount = useGridSelector(apiRef, gridPageCountSelector)

        return (
            <Pagination
                color='primary'
                variant='outlined'
                shape='rounded'
                page={page + 1}
                count={pageCount}
                renderItem={props2 => <PaginationItem {...props2} disableRipple />}
                onChange={(event, value) => apiRef.current.setPage(value - 1)}
            />
        )
    }

    const columns = props.columns

    columns.push({
        field: 'action',
        headerName: 'ACTIONS',
        flex: 0.5,
        renderCell: params => {
            return (
                <>
                    <IconButton
                        size='small'
                        onClick={() => props.onEdit(params.row)}
                    >
                        <Icon icon='mdi:application-edit-outline' fontSize={18} />
                    </IconButton>
                    <IconButton
                        size='small'
                        onClick={() => console.log(params.row)}
                        color='error'
                    >
                        <Icon icon='mdi:delete-forever' fontSize={18} />
                    </IconButton>
                </>
            )
        }
    })

    return (
        <>
            <StripedDataGrid
                rows={props.rows}
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
        </>
    )
}

export default Table

Table.propTypes = {
    isLoading: PropTypes.bool,
    columns: PropTypes.array,
    rows: PropTypes.array,
    selectedRow: PropTypes.array,
    setselectedRow: PropTypes.func,
    onSelectionChange: PropTypes.func
}
