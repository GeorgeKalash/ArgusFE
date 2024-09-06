import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ column: { props }, id, field, value, updateRow, update, data }) {
  console.log('dataaaaa', data)

  let changes = props?.mapping
    ? props.mapping
        ?.map(({ from, to }) => ({
          [from]: data?.[to] || ''
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
    : value

  return (
    <ResourceComboBox
      name={field}
      value={changes}
      autoFocus
      dataGrid={true}
      label={''}
      hasBorder={false}
      onChange={(e, value) => {
        if (props?.mapping) {
          let changes = props.mapping
            .map(({ from, to }) => ({
              [to]: value ? value[from] : ''
            }))
            .reduce((acc, obj) => ({ ...acc, ...obj }), {})
          console.log('changes-up', id, changes)
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
      {...props}
    />
  )
}
