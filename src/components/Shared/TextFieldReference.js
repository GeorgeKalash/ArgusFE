import React, { useContext, useEffect, useState } from 'react'
import CustomTextField from '../Inputs/CustomTextField'

import { RequestsContext } from 'src/providers/RequestsContext'
import { reference } from 'src/lib/reference-helper'

export const TextFieldReference = ({ endpointId, param = '', setReferenceRequired, editMode, ...rest }) => {
  const { getRequest } = useContext(RequestsContext)
  const [state, setState] = useState({ readOnly: false, mandatory: true })

  useEffect(() => {
    setReferenceRequired(true)

    const fetchData = async () => {
      const result = await reference(getRequest, endpointId, param)
      if (!result.error) {
        setState({ readOnly: result.readOnly, mandatory: result.mandatory })
        setReferenceRequired(result.mandatory)
      }
    }
    if (!editMode) {
      fetchData()
    } else {
      setReferenceRequired(false)
      setState({ readOnly: true, mandatory: false })
    }
  }, [param])

  return (
    <>
      <CustomTextField
        {...{
          required: state.mandatory,
          readOnly: editMode ? editMode : state.readOnly,
          ...rest
        }}
      />
    </>
  )
}
