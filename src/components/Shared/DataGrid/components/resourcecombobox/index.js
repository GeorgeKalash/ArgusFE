import edit from './edit'

export default {
  view: props => {
    console.log(props)
    const myArray = props?.column?.props?.displayField
    console.log(myArray)

    if(Array.isArray(myArray) && myArray.length > 1){
      let text = '';

      for (let i = 0; i < myArray.length ; i++) {
        if(i ===0)
          text +=   props?.value?.[myArray[i]]; // Output each element of the array
        else
          text +=  ' '+ props?.value?.[myArray[i]];

      }

     return text.trim(); // Trim to remove extra spaces

    }else{
      return props?.value?.[props.column.props.displayField]

    }
  },
  edit
}
