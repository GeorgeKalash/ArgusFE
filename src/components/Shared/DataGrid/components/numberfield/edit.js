import { useGridApiContext } from '@mui/x-data-grid'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { getNumberWithoutCommas } from 'src/lib/numberField-helper'

export default function NumberfieldEdit({ column: { props }, id, field, value, update }) {
  const api = useGridApiContext()

  const handleNumberFieldNewValue = (newValue, oldValue, min, max) => {
    const regex = /^[0-9,]+(\.\d+)?$/
    if (newValue && regex.test(newValue)) {
      newValue = newValue.replace(/[^0-9.]/g, '')
      const _newValue = getNumberWithoutCommas(newValue)

      return _newValue
    }
  }

  return (
    <CustomNumberField
      value={value}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale} // much number after .
      autoFocus
      hasBorder={false}
      onChange={(e, value) => {
        console.log(e)
        console.log(value)
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
