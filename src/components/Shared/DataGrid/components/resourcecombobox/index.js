import edit from './edit'

export default {
  view: props => {
    const myArray = props?.column?.props?.displayField

    if (Array.isArray(myArray) && myArray.length > 1) {
      const text = myArray
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
