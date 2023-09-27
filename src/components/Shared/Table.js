import LinearProgress from '@mui/material/LinearProgress'
import PropTypes from 'prop-types'
import { DataGrid, gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'

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
                        onClick={() => console.log(params.row)}
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
            <DataGrid
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
