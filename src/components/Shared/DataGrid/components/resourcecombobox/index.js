import edit from './edit'

export default {
  view: props => {
    const displayFields = props?.column?.props?.displayField


    if (Array.isArray(displayFields) && displayFields.length > 1) {
      const text = displayFields
        .filter((item) => props?.value?.[item])
        .map((item) => props?.value?.[item])
        .join(' ');

       return text; // Output the joined text
    }else{
      return props?.value?.[props.column.props.displayField]
    }
  },
  edit
}
