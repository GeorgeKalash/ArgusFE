import edit from './edit'

export default {
  view: props => {

    return props?.value?.[props.column.props.displayField]
  },
  edit
}
