import React, { useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import styles from './MatrixGrid.module.css'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

const MatrixGrid = ({
  intersectionValue = 'X',
  rows = [],
  columns = [],
  intersections,
  setIntersections,
  maxAccess
}) => {
  const gridRef = useRef(null)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [selectedCol, setSelectedCol] = useState(null)

  const { width } = useWindowDimensions()

  const rowHeight =
  width <= 768 ? 35 : width <= 1024 ? 27 : width <= 1280 ? 29.5 : width <=1366 ? 33 : width < 1600 ? 33 : 40

  const rowHeightHeader =
  width <= 768 ? 40 : width <= 1024 ? 65 : width <= 1280 ? 70 : width <=1366 ? 50 : width < 1600 ? 70 : 100

  const widthLabelCell =  width <= 768 ? 160 : width <= 1024 ? 170 : width <= 1280 ? 170 : width <=1366 ? 180 : width < 1600 ? 220 : 250

  const minWidth = width <= 960 ? 65 : width <= 1024 ? 70 : width <= 1280 ? 70 : width <=1366 ? 80 : width < 1600 ? 85 : 80

  const colKeyToRecord = useMemo(() => {
    if (!columns) return {}
    return columns.reduce((acc, col, index) => {
      acc[`col${index + 1}`] = col
      return acc
    }, {})
  }, [columns])

  const initialRowData = useMemo(() => {
    if (!rows || !columns) return []

    return rows.map((rowItem, rIndex) => {
      const row = {
        id: rowItem.id,
        rowLabel: rowItem.rowLabels,
        rowIndex: rIndex,
        ...Object.fromEntries(columns.map((_, cIndex) => [`col${cIndex + 1}`, '']))
      }

      intersections.forEach(inter => {
        const colKey = Object.keys(colKeyToRecord).find(key => colKeyToRecord[key].id === inter.colId)
        if (row.id === inter.rowId && colKey) row[colKey] = intersectionValue
      })

      return row
    })
  }, [rows, columns, intersections, colKeyToRecord, intersectionValue])

  const columnDefs = useMemo(() => {
    const cols = [
      {
        field: 'rowLabel',
        headerName: '',
        pinned: 'left',
        width: widthLabelCell,
        cellClass: styles.rowLabelCell,
      }
    ]

    columns.forEach((colItem, cIndex) => {
      cols.push({
        field: `col${cIndex + 1}`,
        headerName: colItem.colLabels,
        flex: 1,
        minWidth: minWidth,
        headerComponent: props => (
          <div className={styles.rotatedHeader}>{props.displayName}</div>
        ),
        cellClass: params => {
          const rowIndex = params.data?.rowIndex ?? -1
          const colIndex = cIndex

          if (rowIndex === colIndex) return styles.diagonalCell
          if (params.value === intersectionValue) return styles.modifiedCell
          if (selectedRowId === params.data?.id || selectedCol === params.colDef.field)
            return styles.highlightCell

          return styles.normalCell
        }
      })
    })

    return cols
  }, [columns, selectedRowId, selectedCol, intersectionValue])

  const recordIntersection = (rowRecord, colRecord) => {
    if (!rowRecord || !colRecord) return
    const rowIndex = rowRecord.rowIndex
    const colIndex = columns.findIndex(c => c.id === colRecord.id)
    if (rowIndex === colIndex) return

    const api = gridRef.current?.api
    if (!api) return

    const rowNode = api.getRowNode(rowRecord.id)
    const colKey = Object.keys(colKeyToRecord).find(key => colKeyToRecord[key].id === colRecord.id)
    if (!rowNode || !colKey) return

    const newValue = rowNode.data[colKey] === intersectionValue ? '' : intersectionValue
    rowNode.setDataValue(colKey, newValue)

    setIntersections(prev => {
      const existsIndex = prev.findIndex(i => i.rowId === rowRecord.id && i.colId === colRecord.id)
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
    if (!data) return

    if (colDef.field === 'rowLabel') {
      if (selectedCol) {
        recordIntersection(data, colKeyToRecord[selectedCol])
        setSelectedRowId(null)
        setSelectedCol(null)
      } else setSelectedRowId(data.id)
      return
    }

    recordIntersection(data, colKeyToRecord[colDef.field])
  }

  const onColumnHeaderClicked = params => {
    const colId = params.column.getColId()
    if (colId === 'rowLabel') return

    if (selectedRowId !== null) {
      const rowRecord = initialRowData.find(r => r.id === selectedRowId)
      recordIntersection(rowRecord, colKeyToRecord[colId])
      setSelectedRowId(null)
      setSelectedCol(null)
    } else setSelectedCol(colId)
  }

  return (
    <div className={`ag-theme-alpine ${styles.matrixRoot}`}>
      <AgGridReact
        ref={gridRef}
        rowData={initialRowData}
        getRowId={params => params.data.id}
        columnDefs={columnDefs}
        headerHeight={rowHeightHeader}
        rowHeight={rowHeight}
        suppressRowClickSelection
        onCellClicked={onCellClicked}
        onColumnHeaderClicked={onColumnHeaderClicked}
        getRowClass={params =>
          params.data?.id === selectedRowId ? styles.highlightRow : ''
        }
      />
    </div>
  )
}

export default MatrixGrid
