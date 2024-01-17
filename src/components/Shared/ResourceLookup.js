import React , {useContext, useState, useEffect} from 'react'
import CustomLookup from '../Inputs/CustomLookup'
import { RequestsContext } from 'src/providers/RequestsContext'
import ErrorWindow from './ErrorWindow'

export const ResourceLookup = ({endpointId, name, form, parameters,  errorCheck,  ...rest}) => {

  const { getRequest } = useContext(RequestsContext)
  const [errorMessage, setErrorMessage]= useState()
  const [store, setStore] = useState([])

  const onLookup = searchQry => {
    setStore([])
    getRequest({
      extension: endpointId,
      parameters: new URLSearchParams({ ...parameters, '_filter': searchQry })
      })
      .then(res => {
        setStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  const check = errorCheck ? errorCheck : name
  const firstValue = form.values[name]
  const error = form?.touched && form.touched[check] && Boolean(form.errors[check])
  const helperText= form?.touched && form.touched[check] && form.errors[check]

return (
    <>
      <CustomLookup {...{ onLookup, store, setStore, firstValue, error, helperText, ...rest }}  />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}
