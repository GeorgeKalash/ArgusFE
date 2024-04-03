import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ column: { props }, id, field, value, update }) {
  return (
    <ResourceComboBox
      name={field}
      values={{
        [field]: value
      }}
      autoFocus
      label={''}
      hasBorder={false}
      onChange={(e, value) => {
        update({
          id,
          field,
          value: value || ''
        })

        const fieldsToUpdate = props?.fieldsToUpdate
        if (fieldsToUpdate && fieldsToUpdate.length > 0) {
          for (let updateObj of fieldsToUpdate) {
            const { from, to } = updateObj

            update({ id, field: to, value: (value && value[from]) || '' })
          }
        }
      }}
      {...props}
    />
  )
}
