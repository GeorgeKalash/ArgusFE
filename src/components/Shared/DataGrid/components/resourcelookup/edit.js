import { useGridApiContext } from '@mui/x-data-grid'
import { useEffect } from 'react';
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, field, value,  column: { props } }) {
  const api = useGridApiContext()

  useEffect(() => {
    // Perform actions using the API
    if (api.current) {
      // Example: Log the current selection
      console.log('api' , api.current.getSelectedRows());
    }
  }, [api]); // Make sure to include `api` in the dependency array if needed


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
        if (newValue?.recordId)
          api.current.setEditCellValue({
            id,
            field,
            value: newValue
          })

          else

          api.current.setEditCellValue({
            id,
            field,
            value: null
          })

      }}
    />
  )
}
