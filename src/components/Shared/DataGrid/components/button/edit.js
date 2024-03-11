import { Checkbox } from '@mui/material'
import { useGridApiContext } from '@mui/x-data-grid'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function TextFieldEdit({ column: { props }, id, field, value }) {
  const api = useGridApiContext()

  return (
    <Checkbox
    variant='rounded'
    name={field}
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
