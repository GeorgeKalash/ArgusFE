import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function ResourceLookupEdit({ id, field, value, column: { props }, update }) {
  return (
    <ResourceLookup
      autoFocus
      label={''}
      hasBorder={false}
      firstFieldWidth='100%'
      name='field'
      form={{
        values: {
          field: value
        }
      }}
      secondDisplayField={false}
      onChange={(event, newValue) => {

          update({
            id,
            field,
            value: newValue || ''
          })
          const fieldsToUpdate  = props?.fieldsToUpdate
        if (fieldsToUpdate && fieldsToUpdate.length > 0) {
          for (let updateObj of fieldsToUpdate) {
              const { from, to } = updateObj;
              if (newValue && newValue[from]) {
                  update({ id, field: to, value: newValue[from] || ''});
              }
          }
        }
    
      }}
      {...props}
    />
  )
}
