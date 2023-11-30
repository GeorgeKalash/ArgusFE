import { DeleteOutlined } from '@mui/icons-material'
import { DataGrid, GridActionsCellItem, GridRowModes, useGridApiRef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { transformRowsForEditableGrid } from '../helpers/inlineEditGridHelper'
import DeleteDialog from './DeleteDialog'
import { Dialog } from '@mui/material'

export default function CustomInlineDataGrid({
  dataRows,
  setDataRows,
  columns,
  getUpdatedRowFunction,
  newLineOnTab,
  newLineField,
  hasCheckBoxSelection,
  hideColumnMenu,
  requiredFields
}) {
  const [editRowsModel, setEditRowsModel] = useState({})
  const apiRef = useGridApiRef()
  const [rowCount, setRowCount] = useState(dataRows.length)
  const [rows, setRows] = useState(transformRowsForEditableGrid(dataRows))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState([false, {}])

  useEffect(() => {
    if (dataRows)
      setRowCount(dataRows.length)
  }, [dataRows])


  useEffect(() => {
    const handleCellKeyDownEvent = (params, event, details) => {
      console.log(newLineOnTab, 'newLineOnTab')
      if (newLineOnTab) {
        if ((rowCount - 1) == params.id && (event.key === 'Tab' || event.keyCode === 13)) {
          if (params.field === newLineField) {

            let newId = parseInt(params.id) + 1
            setRows([...rows, { id: newId }])
            setDataRows([...rows, { id: newId }])
            apiRef.current.stopRowEditMode({ id: params.id })

            apiRef.current.startRowEditMode({ id: newId, fieldToFocus: 'countryRef' })
          }

          return
        } else if (params.field === newLineField && (event.key === 'Tab' || event.keyCode === 13)) {
          {
            apiRef.current.stopRowEditMode({ id: params.id })
            if (apiRef.current.getRow(parseInt(params.id) + 1))
              apiRef.current.startRowEditMode({ id: parseInt(params.id) + 1 })

          }
        }
      } else {
        console.log('not new line')
      }

      return
    }

    return apiRef.current.subscribeEvent('cellKeyDown', handleCellKeyDownEvent)
  }, [apiRef, rows, dataRows])

  const processRowUpdate = newRow => {
    // const updatedRow = getUpdatedRowFunction(newRow)
    setRows(rows.map(row => (row.id === newRow.id ? newRow : row)))
    setDataRows(rows.map(row => (row.id === newRow.id ? newRow : row)))

    return newRow
  }

  return (
    <div style={{ height: 250, width: '100%' }}>
      <DataGrid
        initialState={{
          columns: {
            columnVisibilityModel: {
              recordId: false
            }
          }
        }}
        apiRef={apiRef}
        rowHeight={40}
        editMode='row'
        disableColumnMenu={hideColumnMenu ? hideColumnMenu : false}
        editRowsModel={editRowsModel}
        processRowUpdate={processRowUpdate}
        
        // rows={dataRows}
        rows={rows}
        onProcessRowUpdateError={(error) => {
          alert(error)
        }}
        columns={[
          ...columns,
          {
            field: 'actions',
            type: 'actions',
            getActions: ({ id, row }) => {
              return [
                <GridActionsCellItem
                  key={id}
                  icon={<DeleteOutlined />}
                  label='delete'
                  onClick={() => {
                    setDeleteDialogOpen([true, row])
                  }}
                />
              ]
            }
          }
        ]}
        hideFooterPagination={true}
        hideFooter={true}
        checkboxSelection={hasCheckBoxSelection}
        slotProps={{
          cell: {
            tabIndex: 1
          }
        }}

      />
      {
        deleteDialogOpen &&
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen([false, {}])}
          onConfirm={obj => {
            if (rows.length > 1) {
              setRows(rows.filter(item => item.id !== obj.id))

            } else {
              setRows([{ id: 0 }])

            }
            setDeleteDialogOpen([false, {}])

          }}
        />
      }
    </div>
  )
}
