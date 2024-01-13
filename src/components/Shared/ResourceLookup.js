import React , {useContext, useState} from 'react'
import CustomLookup from '../Inputs/CustomLookup'
import { RequestsContext } from 'src/providers/RequestsContext'
import ErrorWindow from './ErrorWindow'

export const ResourceLookup = ({endpointId, name, firstValues, parameters,  errorCheck,  ...rest}) => {

  const { getRequest } = useContext(RequestsContext)
  const [errorMessage, setErrorMessage]= useState()
  const [store, setStore] = useState([])

  var newParameters = parameters

  const onLookup = searchQry => {
    setStore([])
    newParameters = new URLSearchParams(newParameters)
    newParameters =  newParameters + '&_filter='+ searchQry

    getRequest({
      extension: endpointId,
      parameters: newParameters
      })
      .then(res => {
        setStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const firstValue = firstValues.values[name]
  const error = firstValues?.touched && firstValues.touched[errorCheck] && Boolean(firstValues.errors[errorCheck])
  const helperText= firstValues?.touched && firstValues.touched[errorCheck] && firstValues.errors[errorCheck]

return (
    <>
      <CustomLookup {...{ onLookup, store, setStore, firstValue, error, helperText, ...rest }}  />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}
