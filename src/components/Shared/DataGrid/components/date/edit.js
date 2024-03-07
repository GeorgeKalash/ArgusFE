import { useGridApiContext } from '@mui/x-data-grid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

export default function DateEdit({ column: { props }, id, field, value }) {
  const api = useGridApiContext()

  return (
    <CustomDatePicker
      autoFocus
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
