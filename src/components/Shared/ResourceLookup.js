import React, { useContext, useState, useEffect } from 'react'
import CustomLookup from '../Inputs/CustomLookup'
import { RequestsContext } from 'src/providers/RequestsContext'
import ErrorWindow from './ErrorWindow'

export const ResourceLookup = ({
  endpointId,
  name,
  form,
  parameters,
  secondValueShow,
  errorCheck,
  valueShow,
  ...rest
}) => {
  const { getRequest } = useContext(RequestsContext)
  const [errorMessage, setErrorMessage] = useState()
  const [store, setStore] = useState([])

  useEffect(() => {
    setStore([])
  }, [parameters])

  const onLookup = searchQry => {
    console.log('searchQry' + searchQry)
    setStore([])
    getRequest({
      extension: endpointId,
      parameters: new URLSearchParams({ ...parameters, _filter: searchQry })
    })
      .then(res => {
        setStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  const check = errorCheck ? errorCheck : name
  const firstValue = valueShow ? form.values[valueShow] : form.values[name]
  const secondValue = secondValueShow ? form.values[secondValueShow] : form.values[name]

  const error = form?.touched && form.touched[check] && Boolean(form.errors[check])
  const helperText = form?.touched && form.touched[check] && form.errors[check]
  console.log('value' , firstValue)

  useEffect(() => {
    setStore([])
  }, [firstValue])

  const onKeyUp = e => {
    if (!e.target.value) setStore([])
  }

  return (
    <>
      <CustomLookup {...{ onLookup, store, setStore, firstValue, secondValue, error, onKeyUp, helperText, ...rest }} />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}
