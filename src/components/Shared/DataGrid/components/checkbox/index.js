import { Checkbox } from '@mui/material'

function CheckBoxComponent({ field, value, data, colDef, updateRow, column, isEditMode }) {
  const handleCheckboxChange = event => {
    const changes = { [colDef.field]: event.target.checked }

    updateRow({ changes })

    if (column?.onChange) {
      column.onChange({
        row: {
          update: changes => updateRow({ changes }),
          newRow: { ...data, ...changes }
        }
      })
    }
  }

  return (
    <Checkbox
      variant='rounded'
      name={field}
      autoFocus={isEditMode}
      checked={value}
      disabled={(!data?.saved && colDef.field === 'select') || column.props?.disabled}
      onClick={handleCheckboxChange}
    />
  )
}

export default {
  view: props => <CheckBoxComponent {...props} isEditMode={false} />,
  edit: props => <CheckBoxComponent {...props} isEditMode={true} />
}
