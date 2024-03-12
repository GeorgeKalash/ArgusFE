import edit from './edit'

export default {
  view: props => {
    const displayFields = props?.column?.props?.displayField

    if(Array.isArray(displayFields) && displayFields.length > 1){
      let text = '';

      for (let i = 0; i < displayFields.length ; i++) {
       if(props?.value?.[displayFields[i]]){
        if(i ===0)
          text +=   props?.value?.[displayFields[i]]; // Output each element of the array
        else
          text +=  ' '+ props?.value?.[displayFields[i]];
        }
      }

     return text.trim(); // Trim to remove extra spaces

    }else{
      return props?.value?.[props.column.props.displayField]

    }
  },
  edit
}
