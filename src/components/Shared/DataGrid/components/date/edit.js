import { useGridApiContext } from '@mui/x-data-grid'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

export default function DateEdit({ column: { props }, id, field, value , update}) {
  const api = useGridApiContext()

  return (
    <CustomDatePicker
      autoFocus
      value={value}
      required={true}
      hasBorder={false}
      onChange={(name, newValue) => {
        update({
          id,
          field,
          value: newValue
        })
      }}
      onClear={() =>
        update({
          id,
          field,
          value: ''
        })
      }
      {...props}
    />
  )
}
