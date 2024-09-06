// import Checkbox from '@material-ui/core/Checkbox';
import { Checkbox } from '@mui/material'

export default function checkBoxEdit({ id, field, value, update, row, column: { props } }) {
  return (
    <Checkbox
      variant='rounded'
      name={field}
      autoFocus
      checked={value}
      disabled={(!row?.saved && field === 'select') || props?.disabled}
      onChange={e => {
        console.log({
          id,
          field,
          value: e.target.checked
        })
        update({
          id,
          field,
          value: e.target.checked
        })
      }}
    />
  )
}
