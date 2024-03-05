import edit from './edit'

export default {
  view: props => {
    console.log(props.value)

    return props?.value?.[props.column.props.displayField]
  },
  edit
}
