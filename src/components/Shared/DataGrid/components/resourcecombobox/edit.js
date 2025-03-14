import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ id, column: { props, field, variableParameters }, value, updateRow, update, data }) {
  let dynamicParams = ''

  if (variableParameters) {
    dynamicParams = variableParameters.map(param => `_${param.key}=${data[param.value] || 0}`).join('&')
  }

  let changes = props?.mapping
    ? props.mapping
        ?.map(({ from, to }) => ({
          [from]: value?.[to] || ''
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
      dynamicParams={dynamicParams}
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
      {...props}
    />
  )
}
