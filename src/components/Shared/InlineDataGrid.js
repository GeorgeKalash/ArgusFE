import { DeleteOutlined } from '@mui/icons-material'
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { transformRowsForEditableGrid } from '../helpers/inlineEditGridHelper'
import DeleteDialog from './DeleteDialog'
import { Dialog } from '@mui/material'

export default function CustomInlineDataGrid({
  dataRows,
  columns,
  getUpdatedRowFunction,
  newLineOnTab,
  newLineField,
  hasCheckBoxSelection,
  hideColumnMenu
}) {
  const [editRowsModel, setEditRowsModel] = useState({})
  const apiRef = useGridApiRef()
  const [rowCount, setRowCount] = useState(dataRows.length)
  const [rows, setRows] = useState(transformRowsForEditableGrid(dataRows))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState([false, {}])


  useEffect(() => {
    setRows(transformRowsForEditableGrid(dataRows))
  }, [dataRows])

  useEffect(()=> console.log(rows,'rows'),[rows])

  useEffect(() => {
    const handleCellKeyDownEvent = (params, event, details) => {
      if (newLineOnTab) {

        if (rowCount == params.id && (event.key === 'Tab' || event.keyCode === 13)) {
          if (params.field === newLineField) {
            setRowCount(rowCount + 1)
            let newId = rowCount + 1
            setRows(oldRows => [...oldRows, { id: newId }])
            apiRef.current.startRowEditMode({id: newId})
            // apiRef.current.setCellFocus(newId, 'countryRef')
            
          }
           return
         
        } 
           return
      } 
      
        return
     
    }

    return apiRef.current.subscribeEvent('cellKeyDown', handleCellKeyDownEvent)
  }, [apiRef, rowCount])

  const processRowUpdate = newRow => {
    // const updatedRow = getUpdatedRowFunction(newRow)
    setRows(rows.map(row => (row.id === newRow.id ? newRow : row)))
    // return updatedRow
    return newRow
  }
 console.log(apiRef.current, 'state')
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
        onRowEditCommit={(id,event) =>{
          console.log('on edit commit', id, event)
        }}
      />
      {
        deleteDialogOpen &&
         <DeleteDialog
         open={deleteDialogOpen}
         onClose={() => setDeleteDialogOpen([false, {}])}
         onConfirm={obj => {
           if (rows.length > 1) {
             setRows(rows.filter(rows => rows.id !== obj.id))
             
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
