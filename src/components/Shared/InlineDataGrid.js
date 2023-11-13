import { DeleteOutlined } from '@mui/icons-material'
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { transformRowsForEditableGrid } from '../helpers/inlineEditGridHelper'
import DeleteDialog from './DeleteDialog'
import { Dialog } from '@mui/material'

export default function CustomInlineDataGrid({
  dataRows,
  setRows,
  columns,
  getUpdatedRowFunction,
  newLineOnTab,
  newLineField,
  hasCheckBoxSelection,
  hideColumnMenu,
}) {
  const [editRowsModel, setEditRowsModel] = useState({})
  const apiRef = useGridApiRef()
  const [rowCount, setRowCount] = useState(dataRows.length)
  // const [rows, setRows] = useState(transformRowsForEditableGrid(dataRows))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState([false, {}])

  useEffect(()=>{
    if(dataRows)
    setRowCount(dataRows.length)
  }, [dataRows])

  useEffect(() => {
    const handleCellKeyDownEvent = (params, event, details) => {
      if (newLineOnTab) {
        if ((rowCount -1 ) == params.id && (event.key === 'Tab' || event.keyCode === 13)) {
         if (params.field === newLineField) {
           // setRowCount(rowCount + 1)
            let newId = rowCount + 1
            setRows([...dataRows, { id: newId }])
          }
           return
        } 
           return
      } 
        return
    }

    return apiRef.current.subscribeEvent('cellKeyDown', handleCellKeyDownEvent)
  }, [apiRef,dataRows])

  const processRowUpdate = newRow => {
    // const updatedRow = getUpdatedRowFunction(newRow)
    setRows(dataRows.map(row => (row.id === newRow.id ? newRow : row)))
    // return updatedRow
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
        rows={dataRows}
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
           if (dataRows.length > 1) {
             setRows(dataRows.filter(item => item.id !== obj.id))
             
           } else {
            setRows( [{ id: 0 }])

           }
           setDeleteDialogOpen([false, {}])

         }}
       />
      }
    </div>
  )
}
