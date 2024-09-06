import React, { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box } from '@mui/material'
import components from './components'
import { CacheDataProvider } from 'src/providers/CacheDataContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

export function DataGrid({ columns, value, height, onChange, disabled = false }) {
  const gridApiRef = useRef(null)

  const addNewRow = () => {
    const newRow = {}
    gridApiRef.current.applyTransaction({ add: [newRow] })
  }

  const onCellKeyDown = params => {
    const { event, columnApi, api, node } = params
    const allColumns = columnApi.getAllColumns()
    const currentColumnIndex = allColumns.findIndex(col => col.getColId() === params.column.getColId())

    if (
      event.key === 'Tab' &&
      currentColumnIndex === allColumns.length - 1 &&
      node.rowIndex === api.getDisplayedRowCount() - 1
    ) {
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

    console.log('data-edit', data)
    const Component =
      typeof column?.colDef?.component === 'string'
        ? components[column?.colDef?.component]?.edit
        : column?.component?.edit

    const maxAccessName = `${params.node.id}.${column.name}`

    // async function updateRow({ changes }) {
    //   if (!params || !params.node) {
    //     return
    //   }

    //   params.node.setDataValue(params.colDef.field, changes)
    // }

    const props = {
      ...column.colDef.props,
      name: maxAccessName,
      maxAccess
    }

    const updateMultipleCellsInRow = ({ changes }) => {
      console.log(changes)
      const id = params.node?.id
      const rowNode = gridApiRef.current.getDisplayedRowAtIndex(id)

      if (rowNode) {
        const currentData = rowNode.data
        const newData = { ...currentData, ...changes }
        rowNode.setData(newData)
      }

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
          {...params}
          column={{
            ...column.colDef,
            props: column.propsReducer ? column?.propsReducer({ data, props }) : props
          }}
          updateRow={updateMultipleCellsInRow}
          update={updateMultipleCellsInRow}
        />
      </Box>
    )
  }

  const columnDefs = columns.map(column => ({
    ...column,
    field: column.name,
    headerName: column.label || column.name,
    editable: !disabled,
    flex: column.flex || 1,
    sortable: false,
    cellRenderer: CustomCellRenderer,
    cellEditor: CustomCellEditor
  }))

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
