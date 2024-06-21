import React, { useRef } from 'react'
import { AgGridReact, AgGridColumn } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import CustomPagination from './CustomPagination'
import { IconButton } from '@mui/material'
import Image from 'next/image'
import editIcon from '../../../public/images/TableIcons/edit.png'
import { useState } from 'react'
import { useEffect } from 'react'
import 'ag-grid-enterprise'
import { useCallback } from 'react'

const TableNew = ({ columns, gridData, paginationType = 'api', ...props }) => {
  const pageSize = props.pageSize
  const api = props?.paginationParameters

  const [gridApi, setGridApi] = useState(null)
  const [current, setCurrent] = useState(1)
  const [newPage, setNewPage] = useState(1)
  const gridRef = useRef()

  const onGridReady = params => {
    setGridApi(params.api)
  }
  columns?.push({
    field: 'actions',
    headerName: 'Actions',
    cellRenderer: params => {
      return (
        <IconButton
          size=''
          onClick={e => {
            props.onEdit(params.data)
          }}
        >
          <Image src={editIcon} alt='Edit' width={18} height={18} />
        </IconButton>
      )
    }
  })
  useEffect(() => {
    if (gridApi && gridData && !gridApi.paginationController?.getModel()?.isPaging()) {
      const serverSideDatasource = {
        getRows: params => {
          const totalCount = gridData?.count

          const page = Math.floor(params.request.startRow / pageSize)
          if (gridApi?.paginationController) {
            gridApi.paginationController.setDatasourceParams({
              page: page
            })
          }
          params.success({ rowData: gridData.list, rowCount: totalCount })
        }
      }
      if (!gridApi?.setServerSideDatasource()) gridApi.setServerSideDatasource(serverSideDatasource)
    }
  }, [gridApi, gridData])

  useEffect(() => {
    // api({ _startAt: newPage * 50, _pageSize: 50 })
  }, [newPage])

  const onPaginationChanged = () => {
    if (gridApi) {
      const newPage = gridApi.paginationGetCurrentPage() || 0
      const newPageSize = gridApi.paginationGetPageSize()

      console.log('New Page:', newPage)
      console.log('New Page Size:', newPageSize)

      // Fetch new data based on the updated page and page size
      if (api && !gridApi?.setServerSideDatasource() && newPage) {
        api({ _startAt: newPage * newPageSize, _pageSize: newPageSize })
      }
    }
  }

  return (
    <div className='ag-theme-alpine' style={{ flex: 1 }}>
      {api ? (
        <>
          <AgGridReact
            ref={gridRef}
            columnDefs={columns}
            rowModelType={'serverSide'}
            pagination={true}
            paginationPageSize={pageSize}
            cacheBlockSize={pageSize}
            rowSelection={'single'}
            paginationPageSizeSelector={[10, 25, 50, 1000]}
            suppressAggFuncInHeader={true}
            onGridReady={onGridReady}
            onPaginationChanged={onPaginationChanged} // Handle pagination changes
          />
        </>
      ) : (
        <AgGridReact
          rowData={rowData}
          columnDefs={columns}
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={pageSize}
          cacheBlockSize={pageSize}
          paginationPageSizeSelector={[10, 25, 50, 1000]}
          suppressAggFuncInHeader={true}
        />
      )}
    </div>
  )
}

export default TableNew
