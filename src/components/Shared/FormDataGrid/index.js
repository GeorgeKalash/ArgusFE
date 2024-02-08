import { DataGrid as MUIDataGrid } from '@mui/x-data-grid'
import components from './components'

export function FormDataGrid({ columns, value, onChange }) {
  async function processDependencies(newRow, oldRow) {
    const changed = columns.filter(({ name }) => newRow[name] !== oldRow[name])

    let updatedRow = { ...newRow }

    for (const change of changed)
      if (change.onChange)
        await change.onChange({
          row: {
            values: newRow,
            update(updates) {
              updatedRow = { ...updatedRow, ...updates }
            }
          }
        })

    return updatedRow
  }

  function handleChange(row) {
    const newRows = [...value]
    const index = newRows.findIndex(({ id }) => id === row.id)
    newRows[index] = row
    onChange(newRows)

    return row
  }

  return (
    <>
      <MUIDataGrid
        processRowUpdate={async (newRow, oldRow) => {
          const updated = await processDependencies(newRow, oldRow)

          return handleChange(updated, oldRow)
        }}
        rows={value}
        editMode='cell'
        columns={columns.map(column => ({
          field: column.name,
          editable: column.editable || true,
          width: column.width || 200,
          renderCell(params) {
            const Component =
              typeof column.component === 'string' ? components[column.component].view : column.component.view

            return <Component {...params} column={column} />
          },
          renderEditCell(params) {
            const Component =
              typeof column.component === 'string' ? components[column.component].edit : column.component.edit

            return <Component {...params} column={column} />
          }
        }))}
      />
    </>
  )
}
