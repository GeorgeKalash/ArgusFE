import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function TextFieldEdit({ column: { props, ...column }, id, field, value, update, updateRow, addRow }) {
  return (
    <CustomTextField
      value={value}
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
      onBlur={e => {
        if (column?.onBlur) {
          column?.onBlur(e, id)
        }
      }}
      onKeyDown={e => {
        console.log(addRow)
        if (column?.onKeyDown) {
          column?.onKeyDown(e, id, updateRow, addRow)
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
