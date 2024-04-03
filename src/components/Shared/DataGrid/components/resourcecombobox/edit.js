import { useGridApiContext } from '@mui/x-data-grid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ column: { props }, id, field, value, updateRow, update, row }) {
  let changes = props?.mapping
    ? props.mapping
        ?.map(({ from, to }) => ({
          [from]: row[to] || ''
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
    : value

  return (
    <ResourceComboBox
      {...props}
      name={field}
      values={{
        [field]: changes
      }}
      autoFocus
      columnsInDropDown={props.columnsInDropDown}
      displayField={props.displayField}
      displayFieldWidth={props.displayFieldWidth}
      label={''}
      hasBorder={false}
      readOnly={props?.readOnly}
      onChange={(e, value) => {
        if (props?.mapping) {
          let changes = props.mapping
            .map(({ from, to }) => ({
              [to]: value ? value[from] : ''
            }))
            .reduce((acc, obj) => ({ ...acc, ...obj }), {})
          updateRow({ id, changes })
        } else {
          update({
            id,
            field,
            value: value || ''
          })

          const fieldsToUpdate = props?.fieldsToUpdate
          if (fieldsToUpdate && fieldsToUpdate.length > 0) {
            for (let updateObj of fieldsToUpdate) {
              const { from, to } = updateObj

              if (value && value[from]) {
                update({ id, field: to, value: value[from] || '' })
              }
            }
          }
        }
      }}
    />
  )
}
