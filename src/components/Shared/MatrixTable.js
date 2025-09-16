import React, { useState, useMemo, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const MatrixGrid = ({
  intersectionValue = 'X',
  rowsList = [],
  columnsList = [],
  intersections,
  setIntersections,
  maxAccess
}) => {
  const gridRef = useRef(null)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [selectedCol, setSelectedCol] = useState(null)
  const [newIntersection, setNewIntersection] = useState([])

  const colKeyToRecord = useMemo(() => {
    if (!columnsList) return {}

    return columnsList.reduce((acc, col, index) => {
      acc[`col${index + 1}`] = col

      return acc
    }, {})
  }, [columnsList])

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
    // Toggle intersection in intersections array
    setIntersections(prev => {
      const existsIndex = prev.findIndex(item => item.rowId === rowRecord.recordId && item.colId === colRecord.recordId)

      if (existsIndex !== -1) {
        // Remove intersection
        const newArr = [...prev]
        newArr.splice(existsIndex, 1)

        return newArr
      }

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

    setNewIntersection(prev =>
      prev.map(row => {
        if (row.recordId === rowRecord.recordId) {
          const colKey = Object.keys(row).find(key => colKeyToRecord[key]?.recordId === colRecord.recordId)
          if (!colKey) return row

          return {
            ...row,
            [colKey]: row[colKey] === intersectionValue ? '' : intersectionValue
          }
        }

        return row
      })
    )
  }

  const onCellClicked = params => {
    const { colDef, data } = params
    const colId = colDef.field
    if (!data) return

    if (colId === 'rowLabel') {
      if (selectedCol) {
        const colRecord = colKeyToRecord[selectedCol]
        recordIntersection(data, colRecord)
        setSelectedRowId(null)
        setSelectedCol(null)
      } else {
        setSelectedRowId(data.recordId)
      }

      return
    }

    const colRecord = colKeyToRecord[colId]
    recordIntersection(data, colRecord)
  }

  const onColumnHeaderClicked = params => {
    const colId = params.column.getColId()
    if (colId === 'rowLabel') return
    const colRecord = colKeyToRecord[colId]

    if (selectedRowId !== null) {
      const rowRecord = newIntersection.find(r => r.recordId === selectedRowId)
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
    </div>
  )
}

export default MatrixGrid
