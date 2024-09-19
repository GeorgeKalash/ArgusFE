import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function NumberfieldEdit({ column: { props }, value, update, node, colDef }) {
  const { id } = node.data
  const { field } = colDef
  return (
    <CustomNumberField
      value={value}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale} // much number after .
      autoFocus
      hasBorder={false}
      onChange={e => {
        console.log({ colDef, node, id, field, value: e.target.value ? Number(e.target.value) : '' })
        update({
          id,
          field,
          value: e.target.value ? Number(e.target.value) : ''
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
