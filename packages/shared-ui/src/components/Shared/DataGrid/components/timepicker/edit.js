import CustomTimePicker from '@argus/shared-ui/src/components/Inputs/CustomTimePicker'

export default function TimeEdit({ column: { props, field }, id, value, update }) {
  const currentValue = value?.[field] || null

  return (
    <CustomTimePicker
      autoFocus
      value={currentValue}
      required={props?.required || false}
      hasBorder={false}
      ampm={!props.use24Hour}
      format="HH:mm"
      onChange={(_, newValue) => {
        update({
          id,
          field,
          value: newValue || null
        })
      }}
      onClear={() =>
        update({
          id,
          field,
          value: null
        })
      }
      {...props}
    />
  )
}