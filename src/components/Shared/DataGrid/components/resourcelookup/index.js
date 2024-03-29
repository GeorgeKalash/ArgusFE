import edit from './edit'

export default {
  view: props => {

    let changes = props?.column?.props.mapping?.map(({ from, to }) => ({
      [from]: props.row && props.row.hasOwnProperty(to) ? props.row[to] : ''
    })).reduce((acc, obj) => ({ ...acc, ...obj }), {});

    return changes[props.column.props.displayField]
  },
  edit
}
