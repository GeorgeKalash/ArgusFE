import React , {useContext, useState} from 'react'
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

  const firstValue = form.values[name]
  const error = form?.touched && form.touched[name] && Boolean(form.errors[name])
  const helperText= form?.touched && form.touched[name] && form.errors[name]

return (
    <>
      <CustomLookup {...{ onLookup, store, setStore, firstValue, error, helperText, ...rest }}  />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}
