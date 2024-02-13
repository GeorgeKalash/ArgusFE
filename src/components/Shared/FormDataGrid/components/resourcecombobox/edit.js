import { useGridApiContext } from '@mui/x-data-grid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ column: { props }, id, field, value }) {
  const api = useGridApiContext()

  return (
    <ResourceComboBox
      {...props}
      name={field}
      values={{
        [field]: value
      }}
      autoFocus
      label={field}
      readOnly={props?.readOnly}
      onChange={(e, value) => {
        api.current.setEditCellValue({
          id,
          field,
          value
        })
      }}
    />
  )
}
