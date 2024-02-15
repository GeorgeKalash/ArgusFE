import { useGridApiContext } from '@mui/x-data-grid'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function ResourceLookupEdit({ id, field, value }) {
  const api = useGridApiContext()

  return (
    <ResourceLookup
      endpointId={SystemRepository.City.snapshot}
      parameters={{
        _countryId: 1,
        _stateId: 0
      }}
      valueField='name'
      displayField='name'
      name='city'
      form={{
        values: {
          city: value
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
      errorCheck={'cityId'}
    />
  )
}
