import { useGridApiContext } from '@mui/x-data-grid'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default {
  view: ({ value }) => value,
  edit({ column: { props }, id, field, value }) {
    const api = useGridApiContext()

    return (
      <CustomTextField
        value={value}
        label={field}
        type='number'
        readOnly={props?.readOnly}
        autoFocus
        onChange={e => {
          api.current.setEditCellValue({
            id,
            field,
            value: parseFloat(e.target.value)
          })
        }}
      />
    )
  }
}
