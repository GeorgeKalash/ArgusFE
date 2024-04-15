import { useGridApiContext } from '@mui/x-data-grid'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function NumberfieldEdit({ column: { props }, id, field, value, update }) {
  const api = useGridApiContext()

  return (
    <CustomNumberField
      value={value}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale} // much number after .
      autoFocus
      hasBorder={false}
      onChange={e => {
        update({
          id,
          field,
          value: e.target.value
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
