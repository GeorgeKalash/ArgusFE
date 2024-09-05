import React, { useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { Box } from '@mui/material'
import components from './components'
import { CacheDataProvider } from 'src/providers/CacheDataContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

export function DataGrid({ columns, value, height, onChange, disabled = false }) {
  const gridApiRef = useRef(null)
  const stagedChanges = useRef({})

  const stageRowUpdate = ({ changes }) => {
    console.log('changes')
    if (!gridApiRef.current || !changes) return

    console.log('changes', gridApiRef.current, changes)
    const rowId = 1

    console.log('Row ID:', rowId)
    console.log('Row:', gridApiRef.current.getRowNode(rowId))

    const updatedRow = {
      ...gridApiRef.current.getRowNode(rowId),
      ...changes
    }

    gridApiRef.current.applyTransaction({ update: [updatedRow] })
    stagedChanges.current[rowId] = changes
  }

  const commitRowUpdate = async id => {
    const changes = stagedChanges.current[id]
    if (!changes) return

    const rowNode = gridApiRef.current.getRowNode(id)
    if (rowNode) {
      Object.assign(rowNode.data, changes)

      gridApiRef.current.applyTransaction({ update: [rowNode.data] })

      onChange && onChange(rowNode.data)

      delete stagedChanges.current[id] // Clear staged changes
    }
  }

  const CustomCellRenderer = params => {
    const { column } = params
    const Component =
      typeof column.colDef.component === 'string'
        ? components[column.colDef.component].view
        : column.colDef.component.view

    // async function updateRow({ changes }) {
    //   console.log('changes-1', changes)
    //   stageRowUpdate({ changes })
    // }

    console.log(params, 'paramsssss', column)
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

    async function updateRow({ changes }) {
      console.log('params inside updateRow:', params.colDef.field, changes)
      if (!params || !params.node) {
        console.error('Params or node is undefined.')
        return
      }

      params.node.setDataValue(params.colDef.field, changes)
    }

    const props = {
      ...column.colDef.props,
      name: maxAccessName,
      maxAccess
    }
    console.log(data?.[params?.colDef?.field], data)
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
          data={data?.[params?.colDef?.field] || data}
          column={{
            ...column.colDef,
            props: column.propsReducer ? column?.propsReducer({ data, props }) : props
          }}
          update={({ value }) => updateRow({ changes: value })}
          updateRow={changes => updateRow(changes)}
          // isLoading={isUpdatingField}
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
            onGridReady={params => {
              gridApiRef.current = params.api
            }}
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
