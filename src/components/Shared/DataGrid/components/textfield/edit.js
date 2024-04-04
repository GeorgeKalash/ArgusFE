import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function TextFieldEdit({ column: { props }, id, field, value, update }) {
  return (
    <CustomTextField
      value={value}
      label={''}
      autoFocus
      hasBorder={false}
      onChange={e => {
        update({
          id,
          field,
          value: e.target.value
        })
      }}
      {...props}
    />
  )
}
