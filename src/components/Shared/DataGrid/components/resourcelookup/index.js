import edit from './edit'

export default {
  view: props => {
    console.log(props?.colDef?.props?.mapping, props?.colDef?.props?.displayField, props)

    let changes = props?.colDef?.props?.mapping
      ? props?.colDef?.props?.mapping
          ?.map(({ from, to }) => ({
            [from]: props.data && props.data.hasOwnProperty(to) ? props.data[to] : ''
          }))
          .reduce((acc, obj) => ({ ...acc, ...obj }), {})
      : props?.value
    console.log(changes)

    return changes?.[props?.colDef?.props?.displayField]
  },
  edit
}
