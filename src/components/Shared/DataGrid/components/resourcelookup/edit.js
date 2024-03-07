import { useGridApiContext } from '@mui/x-data-grid'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, field, value, width , column: { props } }) {
  const api = useGridApiContext()
console.log('field', value)

return (
    <ResourceLookup
      autoFocus
      label={''}
      endpointId={props.endpointId}
      parameters={props.parameters}
      dataGrid={true}
      firstFieldWidth='100%'

      // parameters={{
      //   _countryId: props.parameters._countryId,
      //   _stateId: props.parameters._stateId
      // }}
      valueField={props.displayField}
      displayField={props.valueField}
      name='field'
      form={{
        values: {
          field: value
        }
      }}
      secondDisplayField={false}
      onChange={(event, newValue) => {
        if (newValue)
          api.current.setEditCellValue({
            id,
            field,
            value: newValue
          })
      }}
    />
  )
}
