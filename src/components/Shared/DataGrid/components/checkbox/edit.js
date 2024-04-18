// import Checkbox from '@material-ui/core/Checkbox';
import { Checkbox } from '@mui/material'

export default function checkBoxEdit({ id, field, value, update, row }) {
  return (
    <Checkbox
      variant='rounded'
      name={field}
      autoFocus
      checked={value}
      disabled={!row?.saved && field === 'select'}
      onChange={e => {
        update({
          id,
          field,
          value: e.target.checked
        })
      }}
    />
  )
}
