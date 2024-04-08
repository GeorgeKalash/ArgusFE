import { useGridApiContext } from '@mui/x-data-grid'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { getFormattedNumber, getNumberWithoutCommas } from 'src/lib/numberField-helper'

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
      onChange={e => {
        update({
          id,
          field,
          value: handleNumberFieldNewValue(e.target.value?.split(',')?.join(''), value)
        })
      }}
      onClear={() =>
        api.current.setEditCellValue({
          id,
          field,
          value: ''
        })
      }
      {...props}
    />
  )
}
