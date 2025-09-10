import React, { useState, useMemo, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const MatrixGrid = ({ intersectionValue = 'X', length = 5 }) => {
  const gridRef = useRef(null)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [selectedCol, setSelectedCol] = useState(null)

  // rowData must stay as state to allow updates
  const [rowData, setRowData] = useState(() =>
    length === 0
      ? []
      : Array.from({ length }, (_, rIndex) => ({
          recordId: rIndex,
          rowLabel: `Work center ${rIndex + 1}`,
          ...Object.fromEntries(Array.from({ length }, (_, cIndex) => [`col${cIndex + 1}`, '']))
        }))
  )

  const columnDefs = useMemo(() => {
    const cols = [
      {
        field: 'rowLabel',
        headerName: '',
        pinned: 'left',
        sortable: false,
        headerStyle: { fontWeight: 'bold' }
      }
    ]

    for (let i = 0; i < length; i++) {
      cols.push({
        field: `col${i + 1}`,
        headerName: `Work center ${i + 1}`,
        sortable: false,
        headerStyle: { fontWeight: 'bold' },
        valueGetter: params => params.data?.[`col${i + 1}`] || '',
        cellStyle: params => {
          const rowId = params.data?.recordId ?? -1

          if (rowId === i) {
            return {
              backgroundColor: '#d3d3d3',
              color: '#000',
              pointerEvents: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          }

          if (params.value === intersectionValue) {
            return {
              backgroundColor: '#ffff99',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          }

          if (selectedRowId === rowId || selectedCol === params.colDef.field) {
            return { backgroundColor: '#e0f7fa', display: 'flex', justifyContent: 'center', alignItems: 'center' }
          }

          return {
            backgroundColor: '#fff',
            color: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }
        }
      })
    }

    return cols
  }, [length, selectedRowId, selectedCol, intersectionValue])

  useEffect(() => {
    const api = gridRef.current?.api
    if (!api) return
    api.refreshCells({ force: true, suppressFlash: true })
    api.refreshHeader()
  }, [selectedRowId, selectedCol])

  const onCellClicked = params => {
    const { colDef, data } = params
    const colId = colDef.field

    if (!data) return

    if (colId === 'rowLabel') {
      if (selectedCol) {
        const colIndex = parseInt(selectedCol.replace('col', ''), 10) - 1
        if (data.recordId !== colIndex) {
          setRowData(prev =>
            prev.map(row => (row.recordId === data.recordId ? { ...row, [selectedCol]: intersectionValue } : row))
          )
        }
        setSelectedRowId(null)
        setSelectedCol(null)
      } else {
        setSelectedRowId(data.recordId)
      }

      return
    }

    const colIndex = parseInt(colId.replace('col', ''), 10) - 1
    if (data.recordId === colIndex) return
    setRowData(prev => prev.map(row => (row.recordId === data.recordId ? { ...row, [colId]: intersectionValue } : row)))
  }

  const onColumnHeaderClicked = params => {
    const colId = params.column.getColId()
    if (colId === 'rowLabel') return

    if (selectedRowId !== null) {
      const rowId = selectedRowId
      const colIndex = parseInt(colId.replace('col', ''), 10) - 1
      if (rowId !== colIndex) {
        setRowData(prev => prev.map(row => (row.recordId === rowId ? { ...row, [colId]: intersectionValue } : row)))
      }
      setSelectedRowId(null)
      setSelectedCol(null)
    } else {
      setSelectedCol(colId)
    }
  }

  const cellClassRules = {
    'highlight-col': params => selectedCol && params.colDef.field === selectedCol,
    'modified-cell': params => params.value === intersectionValue
  }

  return (
    <div style={{ height: 400, width: '100%' }} className='ag-theme-alpine'>
      <style>{`
        .bold-header {
          font-weight: bold !important;
        }
        .highlight-row {
          background-color: #e0f7fa !important;
        }
        .highlight-col {
          background-color: #e0f7fa !important;
        }
        .modified-cell {
          background-color: #ffff99 !important;
          font-weight: bold !important;
        }
      `}</style>

      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: false,
          headerClass: params => (selectedCol === params.column.getColId() ? 'highlight-col-header' : 'bold-header')
        }}
        onCellClicked={onCellClicked}
        onColumnHeaderClicked={onColumnHeaderClicked}
        suppressRowClickSelection={true}
        getRowClass={params => (params.data?.recordId === selectedRowId ? 'highlight-row' : '')}
        cellClassRules={cellClassRules}
      />
    </div>
  )
}

export default MatrixGrid
