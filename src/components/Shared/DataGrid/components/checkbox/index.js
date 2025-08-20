import { Checkbox } from '@mui/material'

function CheckBoxComponent({ value, column: { field, props }, updateRow, isEditMode, data }) {
  const handleCheckboxChange = event => {
    const changes = { [field]: event.target.checked }

    updateRow({ changes })
  }

  const disabled = props?.disableCondition && props?.disableCondition(data)

  return (
    <Checkbox
      variant='rounded'
      name={field}
      autoFocus={isEditMode}
      checked={value?.[field]}
      disabled={(!value?.saved && field === 'select') || props?.disabled || disabled}
      onClick={handleCheckboxChange}
    />
  )
}

export default {
  view: props => <CheckBoxComponent {...props} value={props.data} isEditMode={false} />,
  edit: props => <CheckBoxComponent {...props} isEditMode={true} />
}
