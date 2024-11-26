import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, column: { props, field }, value, updateRow, update }) {
  let changes = props?.mapping
    ? props?.mapping
        ?.map(({ from, to }) => ({
          [from]: value && value.hasOwnProperty(to) ? value[to] : ''
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
      valueField={props.valueField}
      displayField={props.displayField}
      columnsInDropDown={props.columnsInDropDown}
      firstValue={changes[props.displayField]}
      secondValue={changes[props.displayField]}
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
