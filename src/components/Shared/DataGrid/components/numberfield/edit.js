import { useGridApiContext } from '@mui/x-data-grid'
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
    <CustomTextField
      value={getFormattedNumber(value)}
      label={''}
      language={'number'}
      autoFocus
      hasBorder={false}
      onChange={e => {
        update({
          id,
          field,
          value: handleNumberFieldNewValue(e.target.value, value)
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
