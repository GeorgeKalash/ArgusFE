import React, { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box, IconButton } from '@mui/material'
import components from './components'
import { CacheDataProvider } from 'src/providers/CacheDataContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { GridDeleteIcon } from '@mui/x-data-grid'

export function DataGrid({ columns, value, height, onChange, disabled = false }) {
  const gridApiRef = useRef(null)

  const addNewRow = () => {
    const highestIndex = value?.length
      ? value.reduce((max, current) => (max['id'] > current['id'] ? max : current))['id'] + 1
      : 1

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

      setTimeout(() => {
        gridApiRef.current.startEditingCell({
          rowIndex: newRowNode.rowIndex,
          colKey: columns[0].name
        })
      }, 50)
    }
  }

  const onCellKeyDown = params => {
    const { event, api, node } = params
    if (event.key === 'Enter') {
      event.stopPropagation()
      return
    }
    if (event.key !== 'Tab') {
      return
    }
    const allColumns = api.getColumnDefs()
    const currentColumnIndex = allColumns?.findIndex(col => col.colId === params.column.getColId())

    console.log(currentColumnIndex, allColumns.length - 2, node.rowIndex, api.getDisplayedRowCount() - 1)
    if (currentColumnIndex === allColumns.length - 2 && node.rowIndex === api.getDisplayedRowCount() - 1) {
      event.preventDefault()
      addNewRow()
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
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center'
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
      const rowNode = gridApiRef.current.getDisplayedRowAtIndex(id)

      if (rowNode) {
        const currentData = rowNode.data
        const newData = { ...currentData, ...changes }
        rowNode.setData(newData)
      }
    }

    async function update({ field, value }) {
      const changes = {
        [field]: value
      }
      setData(changes)
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

  const ActionCellRenderer = params => {
    const handleDelete = () => {
      console.log('Delete clicked', params)
      gridApiRef.current.applyTransaction({ remove: [params.data] })
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
      cellEditor: CustomCellEditor
    })),
    {
      field: 'actions',
      headerName: '',
      flex: 0.5,
      editable: false,
      sortable: false,
      cellRenderer: ActionCellRenderer
    }
  ]

  return (
    <Box sx={{ height: height || 'auto', flex: 1 }}>
      <CacheDataProvider>
        <div className='ag-theme-alpine' style={{ height: '100%', width: '100%' }}>
          <AgGridReact
            apiRef={gridApiRef}
            rowData={value}
            columnDefs={columnDefs}
            domLayout='autoHeight'
            suppressRowClickSelection
            rowSelection='single'
            editType='cell'
            singleClickEdit={true}
            onGridReady={params => {
              gridApiRef.current = params.api
            }}
            onCellKeyDown={onCellKeyDown}
            // onCellValueChanged={params => {
            //   const changes = {
            //     [params.column.colId]: params.newValue
            //   }

            //   stageRowUpdate({
            //     changes: {
            //       id: params.node.id,
            //       ...changes
            //     }
            //   })
            // }}
          />
        </div>
      </CacheDataProvider>
    </Box>
  )
}
