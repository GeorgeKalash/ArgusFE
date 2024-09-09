import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, value, updateRow, column: { props }, update, field }) {
  return (
    <ResourceLookup
      autoFocus
      label={''}
      hasBorder={false}
      displayFieldWidth={props.displayFieldWidth}
      firstFieldWidth='100%'
      userTypes={false}
      valueField={props.valueField}
      displayField={props.displayField}
      columnsInDropDown={props.columnsInDropDown}
      firstValue={value}
      secondValue={value}
      form={{
        values: {}
      }}
      secondDisplayField={false}
      onChange={(e, value) => {
        if (props?.mapping) {
          let changes = props.mapping
            .map(({ from, to }) => ({
              [to]: value ? value[from] : ''
            }))
            .reduce((acc, obj) => ({ ...acc, ...obj }), {})
          updateRow({ id, changes })
        } else {
          update({
            id,
            field,
            value: value || ''
          })
        }
      }}
      {...props}
    />
  )
}
