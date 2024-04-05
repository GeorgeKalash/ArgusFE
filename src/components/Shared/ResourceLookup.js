import React, { useContext, useState, useEffect } from 'react'
import CustomLookup from '../Inputs/CustomLookup'
import { RequestsContext } from 'src/providers/RequestsContext'
import ErrorWindow from './ErrorWindow'

export const ResourceLookup = ({
  endpointId,
  parameters,
  form,
  name,
  firstValue,
  secondValue,
  valueShow,
  secondValueShow,
  errorCheck,
  ...rest
}) => {
  const { getRequest } = useContext(RequestsContext)
  const [errorMessage, setErrorMessage] = useState()
  const [store, setStore] = useState([])

  useEffect(() => {
    setStore([])
  }, [parameters])

  const onLookup = searchQry => {
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

  const _firstValue = firstValue || (valueShow ? form.values[valueShow] : form.values[name])
  const _secondValue = secondValue || (secondValueShow ? form.values[secondValueShow] : form.values[name])

  const error = form?.touched && form.touched[check] && Boolean(form.errors[check])
  const helperText = form?.touched && form.touched[check] && form.errors[check]

  useEffect(() => {
    setStore([])
  }, [_firstValue])

  const onKeyUp = e => {
    if (e.target.value?.length > 0) {
      setStore([])
    } else {
    }
  }

  return (
    <>
      <CustomLookup
        {...{
          onLookup,
          store,
          setStore,
          firstValue: _firstValue,
          secondValue: _secondValue,
          error,
          onKeyUp,
          helperText,
          name,
          ...rest
        }}
      />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}
