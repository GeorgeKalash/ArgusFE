// import Checkbox from '@material-ui/core/Checkbox';
import { Checkbox } from '@mui/material'
import { useGridApiContext } from '@mui/x-data-grid'

export default function TextFieldEdit({ id, field, value, update }) {
  const api = useGridApiContext()

  return (

    <Checkbox
    variant='rounded'
    name={field}
    autoFocus
    checked={value}
    value={value}
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
