import { useGridApiContext } from '@mui/x-data-grid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ column: { props }, id, field, value , update}) {

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
      displayFieldWidth={props.displayFieldWidth}
      label={''}
      hasBorder={false}
      readOnly={props?.readOnly}
      onChange={(e, value) => {
        update({
          id,
          field,
          value : value || ''
        })

        const fieldsToUpdate  = props?.fieldsToUpdate
        if (fieldsToUpdate && fieldsToUpdate.length > 0) {
          for (let updateObj of fieldsToUpdate) {
              const { from, to } = updateObj;

              if (value && value[from]) {
                  update({ id, field: to, value: value[from] || ''});
              }
          }
        }

      }}
    />
  )
}
