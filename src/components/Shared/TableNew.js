import React, { useRef } from 'react'
import { AgGridReact, AgGridColumn } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { IconButton } from '@mui/material'
import Image from 'next/image'
import editIcon from '../../../public/images/TableIcons/edit.png'
import { useState } from 'react'
import { useEffect } from 'react'
import 'ag-grid-enterprise'
import { useCallback } from 'react'

const TableNew = ({ columns, gridData, fetchGridData, paginationType = 'api', ...props }) => {
  const pageSize = props.pageSize
  const api = props?.paginationParameters
  const [gridApi, setGridApi] = useState(null)

  const gridRef = useRef()

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

  const serverSideDatasource = useCallback(
    () => ({
      getRows: async params => {
        const { startRow, endRow } = params.request
        console.log('Requesting rows from', startRow, 'to', endRow)

        try {
          const response = await fetchGridData({ _startAt: startRow, _pageSize: pageSize })
          console.log('response', response)

          const { list, count } = response

          params.success({ rowData: list, rowCount: count })
        } catch (error) {
          console.error('Error fetching data:', error)
          params.fail()
        }
      }
    }),
    [pageSize]
  )

  const onGridReady = params => {
    setGridApi(params.api)
    params.api.setServerSideDatasource(serverSideDatasource())
  }

  useEffect(() => {
    if (gridApi) {
      gridApi.setServerSideDatasource(serverSideDatasource())
    }
  }, [gridApi, serverSideDatasource])

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
