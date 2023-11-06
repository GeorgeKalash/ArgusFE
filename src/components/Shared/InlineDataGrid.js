import { DeleteOutlined } from '@mui/icons-material'
import { DataGrid, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { transformRowsForEditableGrid } from '../helpers/inlineEditGridHelper'

export default function CustomInlineDataGrid({ dataRows, columns, getUpdatedRowFunction }) {
  const [editRowsModel, setEditRowsModel] = useState({})
  const apiRef = useGridApiRef()
  const [seqNo, setSeqNo] = useState(dataRows.length)
  const [rows, setRows] = useState(transformRowsForEditableGrid(dataRows))

  useEffect(() => {
    const handleCellKeyDownEvent = (params, event, details) => {
      if (event.key === 'Tab' || event.keyCode === 13) {
        if (params.field === 'isInactive') {
          setSeqNo(seqNo + 1)
          let newId = seqNo + 1
          setRows(oldRows => [...oldRows, { id: newId }])
        }
      }
    }

    // The `subscribeEvent` method will automatically unsubscribe in the cleanup function of the `useEffect`.
    return apiRef.current.subscribeEvent('cellKeyDown', handleCellKeyDownEvent)
  }, [apiRef, seqNo])

  const processRowUpdate = newRow => {
    // const countryRef = newRow.countryRef
    // const record = productCountriesGridData.find(entry => entry.countryRef === countryRef)
    // const newCountryName = record.countryName
    // const updatedRow = { ...newRow, countryName: newCountryName, isNew: false }
    const updatedRow = getUpdatedRowFunction(newRow)
    console.log(updatedRow, 'updatedRow')
    setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)))

    return updatedRow
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
        editRowsModel={editRowsModel}
        processRowUpdate={processRowUpdate}
        rows={rows}
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
                    if (rows.length > 1) {
                      setRows(rows.filter(row => row.id !== id))
                    }
                  }}
                />
              ]
            }
          }
        ]}
        hideFooterPagination={true}
        hideFooter={true}
      />
    </div>
  )
}
