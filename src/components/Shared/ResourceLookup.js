import React, { useContext, useState, useEffect } from 'react'
import CustomLookup from '../Inputs/CustomLookup'
import { RequestsContext } from 'src/providers/RequestsContext'

export const ResourceLookup = ({
  endpointId,
  parameters,
  form,
  formObject = null,
  name,
  firstValue,
  secondValue,
  valueShow,
  secondValueShow,
  errorCheck,
  filter = {},
  autoSelectFistValue = true,
  viewHelperText = true,
  minChars = 3,
  ...rest
}) => {
  const { getRequest } = useContext(RequestsContext)
  const [store, setStore] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [renderOption, setRenderOption] = useState(false)

  const onLookup = searchQry => {
    setStore([])
    setRenderOption(false)
    if (searchQry?.length >= minChars) {
      setIsLoading(true)
      getRequest({
        extension: endpointId,
        parameters: new URLSearchParams({ ...parameters, _filter: searchQry }),
        disableLoading: true
      })
        .then(res => {
          if (filter) {
            res.list = res.list.filter(item => {
              return Object.keys(filter).every(key => {
                return parseInt(item[key]) == parseInt(filter[key]) || item[key] == filter[key]
              })
            })
          }
          setStore(res.list)
          setRenderOption(true)
        })
        .finally(() => {
          setIsLoading(false)
          setRenderOption(true)
        })
    }
  }

  const _firstValue =
    firstValue ||
    (valueShow
      ? formObject != null
        ? formObject[valueShow]
        : form.values[valueShow]
      : formObject != null
      ? formObject[name]
      : form.values[name])

  const _secondValue =
    secondValue ||
    (secondValueShow
      ? formObject != null
        ? formObject[secondValueShow]
        : form.values[secondValueShow]
      : formObject != null
      ? formObject[name]
      : form.values[name])

  const getErrorState = () => {
    if (!form || !errorCheck) return false
    const fieldPath = errorCheck.split('.')
    if (fieldPath.length > 1) {
      const [parent, child] = fieldPath

      return (form.touched?.[parent]?.[child] || true) && Boolean(form.errors?.[parent]?.[child])
    }

    return form.touched?.[errorCheck] && Boolean(form.errors?.[errorCheck])
  }

  const error = getErrorState()

  useEffect(() => {
    setStore([])
  }, [_firstValue])

  const onKeyUp = e => {
    if (e.key === 'Enter') {
      selectFirstOption()
    }
  }

  const onFocus = () => {
    setStore([])
  }

  const onBlur = (e, HighlightedOption) => {
    !HighlightedOption ? selectFirstOption() : rest.onChange('', HighlightedOption)
  }

  const selectFirstOption = () => {
    if (autoSelectFistValue && store?.[0]) {
      rest.onChange('', store[0])
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
          onFocus,
          onBlur,
          name,
          isLoading,
          renderOption,
          minChars,
          ...rest
        }}
      />
    </>
  )
}
