import edit from './edit'

export default {
  view: props => {
    let changes = props?.colDef?.props?.mapping
      ? props?.colDef.props.mapping
          ?.map(({ from, to }) => ({
            [from]: props.data && props.data.hasOwnProperty(to) ? props.data?.[to] : ''
          }))
          .reduce((acc, obj) => ({ ...acc, ...obj }), {})
      : props?.value

    const displayFields = props?.colDef?.props?.displayField
    if (Array.isArray(displayFields) && displayFields.length > 1) {
      const text = displayFields
        .filter(item => changes?.[item])
        .map(item => changes?.[item])
        .join(' ')

      return text ?? ''
    } else {
      return changes?.[props.colDef.props.displayField]
    }
  },
  edit
}
