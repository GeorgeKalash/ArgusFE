import { useGridApiContext } from '@mui/x-data-grid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ column: { props }, id, field, value , update}) {
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
        if(value)
        api.current.setEditCellValue({
          id,
          field,
          value
        })

        const fieldsToUpdate  = props?.fieldsToUpdate
        if (fieldsToUpdate && fieldsToUpdate.length > 0) {
          for (let updateObj of fieldsToUpdate) {
              const { from, to } = updateObj;
              if (value && value[from]) {
                  console.log(id, to, value[from]);
                  update({ id, field: to, value: value[from] });
              }
          }
      }

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
