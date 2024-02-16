import { useGridApiContext } from '@mui/x-data-grid'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, field, value, column: { props } }) {
  const api = useGridApiContext()

  return (
    <ResourceLookup
      autoFocus
      endpointId={props.endpointId}
      parameters={{
        _countryId: props.parameters._countryId,
        _stateId: props.parameters._stateId
      }}
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
