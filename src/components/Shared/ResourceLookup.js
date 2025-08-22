import React, { useContext, useState, useEffect, useRef } from 'react'
import CustomLookup from '../Inputs/CustomLookup'
import { RequestsContext } from 'src/providers/RequestsContext'

export const ResourceLookup = ({
  endpointId,
  parameters,
  form,
  formObject = null,
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

  const onLookup = async searchQry => {
    setStore([])
    setRenderOption(false)
    if (!endpointId) {
      if (rest.onLookup) {
        const res = await rest?.onLookup(searchQry)
        setStore(res)
        setRenderOption(true)
      }
    } else {
      if (searchQry?.length >= minChars) {
        setIsLoading(true)
        getRequest({
          extension: endpointId,
          parameters: new URLSearchParams({ ...parameters, _filter: searchQry }),
          disableLoading: true
        })
          .then(res => {
            if (filter) {
              res.list = res?.list?.filter(item => {
                return Object.entries(filter).every(([key, value]) => {
                  if (typeof value === 'function') {
                    return value(item[key])
                  }

                  return parseInt(item[key]) == parseInt(value) || item[key] == value
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
  }
  const fieldPath = rest?.name?.split('.')
  const [parent, child] = fieldPath
  const name = child || rest?.name

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

  console.log('in', form.values, formObject)

  const fieldValue = formObject != null ? formObject[name] : form.values[name]
  const lastValue = useRef(fieldValue)

  useEffect(() => {
    console.log('in', fieldValue, lastValue.current)
    const newValue = formObject != null ? formObject[name] : form.values[name]
    if (newValue !== lastValue.current) {
      lastValue.current = newValue

      form.setFieldTouched(name, true)
    }
  }, [fieldValue])

  const getErrorState = () => {
    if (!form || !errorCheck) return false
    const fieldPath = errorCheck.split('.')
    if (fieldPath.length > 1) {
      const [parent, child] = fieldPath

      return form.touched?.[parent]?.[child] && Boolean(form.errors?.[parent]?.[child])
    }

    return form.touched?.[errorCheck] && Boolean(form.errors?.[errorCheck])
  }

  const error = getErrorState()

  useEffect(() => {
    setStore([])
  }, [_firstValue])

  const onKeyUp = (e, HighlightedOption) => {
    if (e.key === 'Enter' && !HighlightedOption) {
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
          store,
          setStore,
          firstValue: _firstValue,
          secondValue: _secondValue,
          error,
          onKeyUp,
          onFocus,
          onBlur,
          name,
          fullName: rest.name,
          isLoading,
          renderOption,
          minChars,
          ...rest,
          onLookup
        }}
      />
    </>
  )
}
