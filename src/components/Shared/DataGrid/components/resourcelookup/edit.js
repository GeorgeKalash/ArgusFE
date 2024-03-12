import { useGridApiContext } from '@mui/x-data-grid'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, field, value, width , column: { props } }) {
  const api = useGridApiContext()

return (
    <ResourceLookup
      autoFocus
      label={''}
      endpointId={props.endpointId}
      parameters={props.parameters}
      dataGrid={true}
      firstFieldWidth='100%'
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
