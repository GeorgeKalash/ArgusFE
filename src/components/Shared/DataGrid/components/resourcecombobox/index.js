import edit from './edit'

export default {
  view: props => {
    console.log('props', props.colDef.field)

    let changes = props?.colDef?.props?.mapping
      ? props?.colDef.props.mapping
          ?.map(({ from, to }) => ({
            [from]: props.data && props.data.hasOwnProperty(to) ? props.data?.[props.colDef.field]?.[to] : ''
          }))
          .reduce((acc, obj) => ({ ...acc, ...obj }), {})
      : props?.value

    console.log('changes', changes)

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
