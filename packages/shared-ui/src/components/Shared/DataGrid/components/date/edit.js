import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

export default function DateEdit({ column: { props, field }, id, value, update }) {
  return (
    <CustomDatePicker
      autoFocus
      value={value?.[field]}
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
