import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

export default function DateEdit({ column: { props }, id, field, value, update }) {
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
