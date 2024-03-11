// import Checkbox from '@material-ui/core/Checkbox';
import { Checkbox } from '@mui/material'
import { useGridApiContext } from '@mui/x-data-grid'

export default function TextFieldEdit({ column: { props }, id, field, value }) {
  const api = useGridApiContext()

  return (

    <Checkbox
    variant='rounded'
    name={field}
autoFocus
    checked={value}
    value={value}
    onChange={e => {
      api.current.setEditCellValue({
        id,
        field,
        value: e.target.value
      })
    }}
     />


  )
}
