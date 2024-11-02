import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function NumberfieldEdit({ id, column: { props, field }, value, update }) {
  return (
    <CustomNumberField
      value={value?.[field]}
      label={''}
      readOnly={props?.readOnly}
      decimalScale={props?.decimalScale}
      autoFocus
      hasBorder={false}
      onChange={e => {
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
