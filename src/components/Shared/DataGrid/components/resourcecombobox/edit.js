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
      columnsInDropDown={props.columnsInDropDown}
      displayField={props.displayField}
      label={''}
      dataGrid={true}
      readOnly={props?.readOnly}
      onChange={(e, value) => {
        api.current.setEditCellValue({
          id,
          field,
          value: value || ''
        })

      }}
    />
  )
}
