import edit from './edit'

export default {
  view: props => {
    let changes = props?.column?.props.mapping
      ? props?.column?.props.mapping
          ?.map(({ from, to }) => ({
            [from]: props.row && props.row.hasOwnProperty(to) ? props.row[to] : ''
          }))
          .reduce((acc, obj) => ({ ...acc, ...obj }), {})
      : props?.value

    const displayFields = props?.column?.props?.displayField
    if (Array.isArray(displayFields) && displayFields.length > 1) {
      const text = displayFields
        .filter(item => changes?.[item])
        .map(item => changes?.[item])
        .join(' ')

      return text ?? ''
    } else {
      return changes?.[props.column.props.displayField]
    }
  },
  edit
}
