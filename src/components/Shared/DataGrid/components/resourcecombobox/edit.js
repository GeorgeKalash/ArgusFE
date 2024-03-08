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
      hasBorder={false}
      readOnly={props?.readOnly}
      onChange={(e, value) => {
        if(value)
        api.current.setEditCellValue({
          id,
          field,
          value
        })

        else

        api.current.setEditCellValue({
          id,
          field,
          value: ''
        })
      }}
    />
  )
}
