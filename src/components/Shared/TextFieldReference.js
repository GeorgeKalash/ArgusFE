import React, {useContext, useEffect, useState} from 'react'
import CustomTextField from '../Inputs/CustomTextField'

import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ErrorWindow from './ErrorWindow'
import { Reference } from 'src/lib/reference-helper'

export const TextFieldReference = ({endpointId , param = '', setReferenceRequired, editMode,  ...rest}  ) => {
   const { getRequest } = useContext(RequestsContext)
   const [state ,setState] = useState({readOnly: false , mandatory : true})
   const [errorMessage, setErrorMessage] = useState(null)

   useEffect(() => {
    setReferenceRequired(true)


    const fetchData = async () => {
      const result = await Reference(getRequest, endpointId, param);
      console.log(result);
     if(!result.error){
       setState({ readOnly: result.readOnly, mandatory: result.mandatory });
       setReferenceRequired(result.mandatory)

      }else{
        setErrorMessage(result.error)
      }
    };
    if(!editMode){
    fetchData();
    }else{
      setReferenceRequired(false)
      setState({ readOnly: true, mandatory: false });

    }

  }, [param]);

  return (
    <>
  <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />

   <CustomTextField
    {...{
      required : state.mandatory,
      readOnly : state.readOnly,
        ...rest}}
    />
    </>
  )
}
