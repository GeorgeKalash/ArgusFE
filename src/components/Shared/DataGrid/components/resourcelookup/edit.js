import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, value, data, updateRow, column: { props }, update, field, name }) {
  let changes = props?.mapping
    ? props.mapping
        ?.map(({ from, to }) => ({
          [from]: data?.[to] || ''
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
    : value

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
      firstValue={changes}
      secondValue={changes}
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
