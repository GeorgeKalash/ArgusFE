import { useGridApiContext } from '@mui/x-data-grid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function ResourceComboBoxEdit({ column: { props }, id, field, updateRow, row }) {
  let changes = props.mapping
    .map(({ from, to }) => ({
      [from]: row[to] || ''
    }))
    .reduce((acc, obj) => ({ ...acc, ...obj }), {})

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
        let changes = props.mapping
          .map(({ from, to }) => ({
            [to]: value ? value[from] : ''
          }))
          .reduce((acc, obj) => ({ ...acc, ...obj }), {})
        updateRow({ id, changes })
      }}
    />
  )
}
