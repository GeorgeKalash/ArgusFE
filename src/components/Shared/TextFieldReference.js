import React, {useContext, useEffect, useState} from 'react'
import CustomTextField from '../Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ErrorWindow from './ErrorWindow'

export const TextFieldReference = ({endpointId , param = '', setReferenceRequired,  ...rest}  ) => {
   const { getRequest } = useContext(RequestsContext)
   const [state ,setState] = useState({enabled: false , mandatory : true})
   const [errorMessage, setErrorMessage] = useState(null)

   useEffect(() => {

    setReferenceRequired(true)

    var parameters = '_key=' + param;

    getRequest({
      extension: endpointId,
      parameters,
    })
      .then((res) => {
        if (res?.record?.value) {
          const value = res?.record?.value;
          parameters = '_recordId=' + value;

          return getRequest({
            extension: SystemRepository.NumberRange.get,
            parameters,
          });
        }
      })
      .then((res) => {
        if (res && !res.record.external) {
          setState({ enabled: true, mandatory: false });
          setReferenceRequired(false);
        }
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  }, [param]);

  return (
    <>
  <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />

   <CustomTextField
    {...{
      required : state.mandatory,
      readOnly : state.enabled,
        ...rest}}
    />
    </>
  )
}
