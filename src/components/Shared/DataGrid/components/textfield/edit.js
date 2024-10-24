import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function TextFieldEdit({ column: { props, ...column }, id, field, value, update }) {
  return (
    <CustomTextField
      value={value || undefined}
      label={''}
      autoFocus
      hasBorder={false}
      onClear={e =>
        update({
          id,
          field,
          value: ''
        })
      }
      onBlur={(e) => {
        if (column?.onBlur) {
          column?.onBlur(e, id);
        }
      }}
      onKeyDown={(e) => {
        if (column?.onKeyDown) {
          column?.onKeyDown(e, id);
        }
      }}
      onChange={e => {
        update({
          id,
          field,
          value: e.target.value || ''
        })
      }}
      {...props}
    />
  )
}
