import React, { useMemo, useRef, useState } from 'react'
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

  const colKeyToRecord = useMemo(() => {
    if (!columnsList) return {}

    return columnsList.reduce((acc, col, index) => {
      acc[`col${index + 1}`] = col

      return acc
    }, {})
  }, [columnsList])

  const initialRowData = useMemo(() => {
    if (!rowsList || !columnsList) return []

    return rowsList.map((rowItem, rIndex) => {
      const row = {
        id: rowItem.id,
        rowLabel: rowItem.rowLabels,
        rowIndex: rIndex,
        ...Object.fromEntries(columnsList.map((_, cIndex) => [`col${cIndex + 1}`, '']))
      }

      intersections.forEach(inter => {
        const colKey = Object.keys(colKeyToRecord).find(key => colKeyToRecord[key].id === inter.colId)
        if (row.id === inter.rowId && colKey) {
          row[colKey] = intersectionValue
        }
      })

      return row
    })
  }, [rowsList, columnsList, intersections, colKeyToRecord, intersectionValue])

  const columnDefs = useMemo(() => {
    if (!columnsList) return []

    const cols = [
      {
        field: 'rowLabel',
        headerName: '',
        pinned: 'left',
        sortable: false,
        headerStyle: { fontWeight: 'bold' },
        cellStyle: {
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }
    ]

    columnsList.forEach((colItem, cIndex) => {
      cols.push({
        field: `col${cIndex + 1}`,
        headerName: colItem.colLabels,
        sortable: false,
        flex: 1,
        headerComponent: props => (
          <div
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center center',
              whiteSpace: 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {props.displayName}
          </div>
        ),
        cellStyle: params => {
          const rowIndex = params.data?.rowIndex ?? -1
          const colIndex = cIndex

          if (rowIndex === colIndex) {
            return {
              backgroundColor: '#d3d3d3',
              color: '#888',
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

          if (selectedRowId === params.data?.id || selectedCol === params.colDef.field) {
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

  const recordIntersection = (rowRecord, colRecord) => {
    if (!rowRecord || !colRecord) return
    const rowIndex = rowRecord.rowIndex
    const colIndex = columnsList.findIndex(c => c.id === colRecord.id)
    if (rowIndex === colIndex) return
    const api = gridRef.current?.api
    if (!api) return

    const rowNode = api.getRowNode(rowRecord.id)
    const colKey = Object.keys(colKeyToRecord).find(key => colKeyToRecord[key].id === colRecord.id)
    if (!rowNode || !colKey) return

    const newValue = rowNode.data[colKey] === intersectionValue ? '' : intersectionValue
    rowNode.setDataValue(colKey, newValue)

    setIntersections(prev => {
      const existsIndex = prev.findIndex(item => item.rowId === rowRecord.id && item.colId === colRecord.id)
      if (existsIndex !== -1) {
        const newArr = [...prev]
        newArr.splice(existsIndex, 1)

        return newArr
      }

      return [...prev, { rowId: rowRecord.id, colId: colRecord.id }]
    })
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
        setSelectedRowId(data.id)
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
      const rowRecord = initialRowData.find(r => r.id === selectedRowId)
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
        rowData={initialRowData}
        getRowId={params => params.data.id}
        columnDefs={columnDefs}
        headerHeight={100}
        domLayout='autoHeight'
        defaultColDef={{
          sortable: false,
          headerClass: params => (selectedCol === params.column.getColId() ? 'highlight-col-header' : 'bold-header')
        }}
        onCellClicked={onCellClicked}
        onColumnHeaderClicked={onColumnHeaderClicked}
        suppressRowClickSelection={true}
        getRowClass={params => (params.data?.id === selectedRowId ? 'highlight-row' : '')}
        cellClassRules={cellClassRules}
      />
    </div>
  )
}

export default MatrixGrid
