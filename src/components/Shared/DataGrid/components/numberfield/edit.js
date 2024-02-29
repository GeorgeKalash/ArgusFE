import { useGridApiContext } from '@mui/x-data-grid'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { getFormattedNumber, getNumberWithoutCommas } from 'src/lib/numberField-helper'

export default function NumberfieldEdit({ column: { props }, id, field, value }) {
  const api = useGridApiContext()

  const handleNumberFieldNewValue = (newValue, oldValue, min, max) => {
    const regex = /^[0-9,]+(\.\d+)?$/
    if (newValue && regex.test(newValue)) {
      const _newValue = getNumberWithoutCommas(newValue)
      console.log(_newValue)
      if ((min && _newValue < min) || (max && _newValue > max)) return oldValue
      else return getFormattedNumber(newValue)
    }
  }

return (
    <CustomTextField
      value={value}
      label={''}

      // type='number'
      readOnly={props?.readOnly}
      autoFocus
      dataGrid={true}
      onChange={e => {
        api.current.setEditCellValue({
          id,
          field,
          value: handleNumberFieldNewValue(
            e.target.value,
            value
          )
        })
      }}
      onClear={() =>api.current.setEditCellValue({
        id,
        field,
        value: ''
      })}
    />
  )
}
