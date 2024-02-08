import { useGridApiContext } from '@mui/x-data-grid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function ResourceComboBoxEdit({ id, field, value, readOnly }) {
  const api = useGridApiContext()

  return (
    <ResourceComboBox
      endpointId={SystemRepository.Currency.page}
      parameters={`_startAt=0&_pageSize=10000&filter=`}
      value={value}
      name={field}
      valueField='recordId'
      displayField='reference'
      values={{
        [field]: value
      }}
      label={field}
      readOnly={readOnly}
      onChange={(e, v) => {
        api.current.setEditCellValue({
          id,
          field,
          value: v?.recordId
        })
      }}
    />
  )
}
