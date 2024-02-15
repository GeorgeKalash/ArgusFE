import { useGridApiContext } from '@mui/x-data-grid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

export default {
  view({ value }) {
    return value?.toISOString()
  },
  edit({ column: { props }, id, field, value }) {
    const api = useGridApiContext()

    return (
      <CustomDatePicker
        value={value}
        required={true}
        onChange={(name, newValue) => {
          api.current.setEditCellValue({
            id,
            field,
            value: newValue
          })
        }}
        onClear={() =>
          api.current.setEditCellValue({
            id,
            field,
            value: ''
          })
        }
        disabledDate={props?.disabledDate}
      />
    )
  }
}
