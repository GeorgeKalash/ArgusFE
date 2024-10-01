import React, { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, IconButton } from '@mui/material'
import components from './components'
import { CacheDataProvider } from 'src/providers/CacheDataContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { GridDeleteIcon } from '@mui/x-data-grid'

export function DataGrid({
  columns,
  value,
  error,
  height,
  onChange,
  disabled = false,
  allowDelete = true,
  allowAddNewLine = true
}) {
  const gridApiRef = useRef(null)

  // useEffect(() => {
  //   if (!value?.length && allowAddNewLine) {
  //     addNewRow()
  //   }
  // }, [value])

  const addNewRow = params => {
    const highestIndex = params.node.data.id + 1

    const defaultValues = Object.fromEntries(
      columns.filter(({ name }) => name !== 'id').map(({ name, defaultValue }) => [name, defaultValue])
    )

    const newRow = {
      id: highestIndex,
      ...defaultValues
    }

    const res = gridApiRef.current.applyTransaction({ add: [newRow] })

    if (res.add.length > 0) {
      const newRowNode = res.add[0]
      commit(newRowNode.data)

      setTimeout(() => {
        const rowNode = gridApiRef.current.getRowNode(newRowNode.data.id)

        if (rowNode) {
          const rowIndex = rowNode.rowIndex
          gridApiRef.current.startEditingCell({
            rowIndex: rowIndex,
            colKey: columns[0].name
          })
        }
      }, 0)
    }
  }

  const onCellKeyDown = params => {
    const { event, api, node } = params

    if (event.key !== 'Tab') {
      return
    }

    const allColumns = api.getColumnDefs()
    const currentColumnIndex = allColumns?.findIndex(col => col.colId === params.column.getColId())

    if (
      currentColumnIndex === allColumns.length - 2 &&
      node.rowIndex === api.getDisplayedRowCount() - 1 &&
      allowAddNewLine
    ) {
      event.stopPropagation()
      addNewRow(params)
    } else {
      const currentRowIndex = node.rowIndex
      const currentColId = params.column.getColId()
      const allColumns = api.getColumnDefs()
      const currentColumnIndex = allColumns.findIndex(col => col.colId === currentColId)
      if (currentColumnIndex < allColumns.length - 2) {
        const nextColumnId = allColumns[currentColumnIndex + 1].colId
        api.startEditingCell({
          rowIndex: currentRowIndex,
          colKey: nextColumnId
        })
      } else {
        const nextColumnId = allColumns[0].colId
        api.startEditingCell({
          rowIndex: currentRowIndex + 1,
          colKey: nextColumnId
        })
      }
    }
  }

  const CustomCellRenderer = params => {
    const { column } = params

    const Component =
      typeof column.colDef.component === 'string'
        ? components[column.colDef.component].view
        : column.colDef.component.view

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          padding: '0 1000px',
          display: 'flex'
        }}
      >
        <Component {...params} column={column} />
      </Box>
    )
  }

  const CustomCellEditor = params => {
    const { column, data, maxAccess } = params

    const Component =
      typeof column?.colDef?.component === 'string'
        ? components[column?.colDef?.component]?.edit
        : column?.component?.edit

    const maxAccessName = `${params.node.id}.${column.name}`

    const props = {
      ...column.colDef.props,
      name: maxAccessName,
      maxAccess
    }

    const setData = changes => {
      const id = params.node?.id
      const rowNode = params.api.getRowNode(id)
      if (rowNode) {
        const currentData = rowNode.data
        console.log('currentData', currentData)
        const newData = { ...currentData, ...changes }
        rowNode.updateData(newData)
      }
    }

    async function update({ field, value }) {
      const changes = {
        [field]: value
      }

      setData(changes)
      !value && params.api.stopEditing()
      !value &&
        gridApiRef.current.startEditingCell({
          rowIndex: params.node.rowIndex,
          colKey: field
        })
    }

    const updateRow = ({ changes }) => {
      setData(changes)
      params.api.stopEditing()
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          padding: '0 0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            (column.component === 'checkbox' || column.component === 'button' || column.component === 'icon') &&
            'center'
        }}
      >
        <Component
          id={params.node.data.id}
          field={params.colDef.field}
          {...params}
          column={{
            ...column.colDef,
            props: column.propsReducer ? column?.propsReducer({ data, props }) : props
          }}
          updateRow={updateRow}
          update={update}
        />
      </Box>
    )
  }

  const getCellStyle = params => {
    const hasError = error && error[params.node.rowIndex]?.[params.colDef.field]

    return {
      border: hasError ? '1px solid #ff0000' : '1px solid transparent'
    }
  }

  const ActionCellRenderer = params => {
    const handleDelete = () => {
      gridApiRef.current.applyTransaction({ remove: [params.data] })

      const newRows = gridApiRef.current?.data?.filter(({ id }) => id !== params.data.id)

      onChange(newRows)
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <IconButton onClick={handleDelete} disabled={disabled}>
          <GridDeleteIcon />
        </IconButton>
      </Box>
    )
  }

  const columnDefs = [
    ...columns.map(column => ({
      ...column,
      field: column.name,
      headerName: column.label || column.name,
      editable: !disabled,
      flex: column.flex || 1,
      sortable: false,
      cellRenderer: CustomCellRenderer,
      cellEditor: CustomCellEditor,
      cellStyle: getCellStyle,
      suppressKeyboardEvent: params => {
        return true
      }
    })),
    allowDelete
      ? {
          field: 'actions',
          headerName: '',
          flex: 0.5,
          editable: false,
          sortable: false,
          cellRenderer: ActionCellRenderer
        }
      : null
  ].filter(Boolean)

  const onCellEditingStopped = params => {
    const { data } = params
    gridApiRef.current.applyTransaction({ update: [data] })
    commit(data)
  }

  const commit = data => {
    const allRowNodes = []
    gridApiRef.current.forEachNode(node => allRowNodes.push(node.data))
    const updatedGridData = allRowNodes.map(row => (row.id === data.id ? data : row))

    onChange(updatedGridData)
  }

  return (
    <Box sx={{ height: height || 'auto', flex: 1 }}>
      <CacheDataProvider>
        <div className='ag-theme-alpine' style={{ height: '100%', width: '100%' }}>
          {value && (
            <AgGridReact
              gridApiRef={gridApiRef}
              rowData={value}
              columnDefs={columnDefs}
              suppressRowClickSelection={false}
              stopEditingWhenCellsLoseFocus={true}
              rowSelection='single'
              editType='cell'
              singleClickEdit={true}
              onGridReady={params => {
                gridApiRef.current = params.api
                onChange(value)
              }}
              onCellKeyDown={onCellKeyDown}
              onCellEditingStopped={onCellEditingStopped}
              getRowId={params => params?.data?.id}
            />
          )}
        </div>
      </CacheDataProvider>
    </Box>
  )
}
