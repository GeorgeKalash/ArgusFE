import React, { useState, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const MatrixGrid = () => {
  const gridRef = useRef(null)

  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedCol, setSelectedCol] = useState(null)

  const [rowData, setRowData] = useState(
    Array.from({ length: 5 }, (_, rIndex) => {
      const row = { rowLabel: `Row ${rIndex + 1}` }
      for (let c = 1; c <= 5; c++) {
        row[`col${c}`] = `R${rIndex + 1}C${c}`
      }

      return row
    })
  )

  const columnDefs = useMemo(() => {
    const cols = [{ headerName: 'Row', field: 'rowLabel', pinned: 'left', sortable: false }]
    for (let i = 1; i <= 5; i++) {
      cols.push({ headerName: `Col ${i}`, field: `col${i}`, sortable: false })
    }

    return cols
  }, [])

  // Row label click
  const onCellClicked = params => {
    if (params.colDef.field === 'rowLabel') setSelectedRow(params.rowIndex)
  }

  // Column header click
  const onColumnHeaderClicked = params => {
    const colId = params.column.getColId()
    if (colId === 'rowLabel') return
    if (selectedRow === null) return // no row selected

    const rowIndex = selectedRow
    const colIndex = parseInt(colId.replace('col', ''), 10) - 1

    // Skip diagonal cells silently
    if (rowIndex === colIndex) {
      setSelectedRow(null)
      setSelectedCol(null)

      return
    }

    // Modify intersection
    setRowData(prev => {
      const updated = [...prev]
      updated[rowIndex] = {
        ...updated[rowIndex],
        [colId]: '✅ Modified'
      }

      return updated
    })

    // Reset selection
    setSelectedRow(null)
    setSelectedCol(null)
  }

  const getRowClass = params => (params.node.rowIndex === selectedRow ? 'highlight-row' : '')

  const cellClassRules = {
    'highlight-intersection': params =>
      params.node.rowIndex === selectedRow && params.colDef.field === selectedCol && selectedCol !== 'rowLabel',
    'disabled-cell': params => {
      const colIndex = parseInt(params.colDef.field.replace('col', ''), 10) - 1

      return params.node.rowIndex === colIndex
    }
  }

  return (
    <div style={{ height: 400, width: '100%' }} className='ag-theme-alpine'>
      <style>{`
        .highlight-row {
          background-color: #e0f7fa !important;
        }

        .highlight-intersection {
          background-color: #ffcc80 !important;
          font-weight: bold;
        }

        .disabled-cell {
          background-color: #f5f5f5 !important;
          color: #aaa;
          pointer-events: none;
        }
      `}</style>

      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        onCellClicked={onCellClicked}
        onColumnHeaderClicked={col => {
          setSelectedCol(col.column.getColId())
          onColumnHeaderClicked(col)
        }}
        suppressRowClickSelection={true}
        suppressSorting={true}
        getRowClass={getRowClass}
        cellClassRules={cellClassRules}
      />
    </div>
  )
}

export default MatrixGrid
