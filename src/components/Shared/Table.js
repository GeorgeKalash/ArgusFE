import React, { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { IconButton } from '@mui/material'
import Image from 'next/image'
import editIcon from '../../../public/images/TableIcons/edit.png'
import { useState } from 'react'
import { useEffect } from 'react'
import 'ag-grid-enterprise'
import { useCallback } from 'react'

const Table = ({ columns, gridData, fetchGridData, paginationType = 'api', ...props }) => {
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

  useEffect(() => {
    paginationType === 'api' && api({ _startAt: 0, _pageSize: pageSize })
  }, [paginationType])

  const getRowClass = params => {
    return params?.rowIndex % 2 === 0 ? 'even-row' : ''
  }

  const onPaginationChanged = event => {
    console.log('event', event)
    const newPage = event.api.paginationGetCurrentPage()
    console.log('newPage', newPage)
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
            getRowClass={getRowClass}
            onPaginationChanged={onPaginationChanged}
          />
        </>
      ) : (
        <AgGridReact
          rowData={gridData?.list}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={pageSize}
          cacheBlockSize={pageSize}
          rowSelection={'single'}
          paginationPageSizeSelector={[10, 25, 50, 1000]}
          suppressAggFuncInHeader={true}
          getRowClass={getRowClass}
          onPaginationChanged={onPaginationChanged}
        />
      )}
    </div>
  )
}

export default Table
