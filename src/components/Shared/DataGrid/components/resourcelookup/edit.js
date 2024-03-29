import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, field, value, updateRow, column: { props } , update }) {

return (
    <ResourceLookup
      autoFocus
      label={''}
      endpointId={props.endpointId}
      parameters={props.parameters}
      hasBorder={false}
      displayFieldWidth={props.displayFieldWidth}
      firstFieldWidth='100%'
      valueField={props.valueField}
      displayField={props.displayField}
      columnsInDropDown={props.columnsInDropDown}
      name='field'
      form={{
        values: {
          field: value
        }
      }}
      secondDisplayField={false}
      onChange={(e, value) => {
        let changes = props.mapping.map(({ from, to }) => ({
          [to]: value ? value[from] : ''
        })).reduce((acc, obj) => ({ ...acc, ...obj }), {});
        updateRow({ id, changes })
      }}
    />
  )
}
