import React, { useState, useMemo, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const MatrixGrid = ({ intersectionValue = 'X', rowsList = [], columnsList = [], intersections, setIntersections }) => {
  const gridRef = useRef(null)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [selectedCol, setSelectedCol] = useState(null)
  const [newIntersection, setNewIntersection] = useState([])

  // Map column keys to actual record
  const colKeyToRecord = useMemo(() => {
    if (!columnsList) return {}

    return columnsList.reduce((acc, col, index) => {
      acc[`col${index + 1}`] = col

      return acc
    }, {})
  }, [columnsList])

  // Build newIntersection and pre-fill intersections
  useEffect(() => {
    if (!rowsList || rowsList.length === 0 || !columnsList || columnsList.length === 0) return

    const rows = rowsList.map((rowItem, rIndex) => {
      const row = {
        recordId: rowItem.recordId,
        rowLabel: rowItem.name,
        rowRef: rowItem.reference,
        rowIndex: rIndex,
        ...Object.fromEntries(columnsList.map((_, cIndex) => [`col${cIndex + 1}`, '']))
      }

      // Pre-fill intersections if any
      intersections.forEach(inter => {
        const colKey = Object.keys(colKeyToRecord).find(key => colKeyToRecord[key].recordId === inter.colId)
        if (row.recordId === inter.rowId && colKey) {
          row[colKey] = intersectionValue
        }
      })

      return row
    })

    setNewIntersection(rows)
  }, [rowsList, columnsList, intersections, colKeyToRecord, intersectionValue])

  const columnDefs = useMemo(() => {
    if (!columnsList || columnsList.length === 0) return []

    const cols = [
      {
        field: 'rowLabel',
        headerName: '',
        pinned: 'left',
        sortable: false,
        headerStyle: { fontWeight: 'bold' }
      }
    ]

    columnsList.forEach((colItem, cIndex) => {
      cols.push({
        field: `col${cIndex + 1}`,
        headerName: colItem.name,
        sortable: false,
        headerStyle: { fontWeight: 'bold' },
        valueGetter: params => params.data?.[`col${cIndex + 1}`] || '',
        cellStyle: params => {
          const rowIndex = params.data?.rowIndex ?? -1

          // Disable diagonal cells if rowIndex matches column index
          if (rowIndex === cIndex) {
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

          if (selectedRowId === params.data?.recordId || selectedCol === params.colDef.field) {
            return {
              backgroundColor: '#e0f7fa',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
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
    })

    return cols
  }, [columnsList, selectedRowId, selectedCol, intersectionValue])

  useEffect(() => {
    const api = gridRef.current?.api
    if (!api) return
    api.refreshCells({ force: true, suppressFlash: true })
    api.refreshHeader()
  }, [selectedRowId, selectedCol])

  const recordIntersection = (rowRecord, colRecord) => {
    setIntersections(prev => {
      const alreadyExists = prev.some(item => item.rowId === rowRecord.recordId && item.colId === colRecord.recordId)
      if (alreadyExists) return prev

      return [
        ...prev,
        {
          rowId: rowRecord.recordId,
          colId: colRecord.recordId,
          rowRef: rowRecord.rowRef,
          rowName: rowRecord.rowLabel,
          colRef: colRecord.reference,
          colName: colRecord.name
        }
      ]
    })
  }

  const onCellClicked = params => {
    const { colDef, data } = params
    const colId = colDef.field
    if (!data) return

    if (colId === 'rowLabel') {
      if (selectedCol) {
        const colRecord = colKeyToRecord[selectedCol]
        setNewIntersection(prev =>
          prev.map(row => (row.recordId === data.recordId ? { ...row, [selectedCol]: intersectionValue } : row))
        )
        recordIntersection(data, colRecord)
        setSelectedRowId(null)
        setSelectedCol(null)
      } else {
        setSelectedRowId(data.recordId)
      }

      return
    }

    const colRecord = colKeyToRecord[colId]
    setNewIntersection(prev =>
      prev.map(row => (row.recordId === data.recordId ? { ...row, [colId]: intersectionValue } : row))
    )
    recordIntersection(data, colRecord)
  }

  const onColumnHeaderClicked = params => {
    const colId = params.column.getColId()
    if (colId === 'rowLabel') return
    const colRecord = colKeyToRecord[colId]

    if (selectedRowId !== null) {
      const rowRecord = newIntersection.find(r => r.recordId === selectedRowId)
      setNewIntersection(prev =>
        prev.map(row => (row.recordId === rowRecord.recordId ? { ...row, [colId]: intersectionValue } : row))
      )
      recordIntersection(rowRecord, colRecord)
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
    <div style={{ height: 450, width: '100%' }} className='ag-theme-alpine'>
      <AgGridReact
        ref={gridRef}
        rowData={newIntersection}
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
      <pre>{JSON.stringify(intersections, null, 2)}</pre>
    </div>
  )
}

export default MatrixGrid
