import { useGridApiContext } from '@mui/x-data-grid'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function TextFieldEdit({ id, field, value }) {
  const api = useGridApiContext()

  return (
    <CustomTextField
      value={value}
      label={field}
      readOnly={false}
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
