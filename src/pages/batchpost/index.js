import React, { useContext } from 'react'
import { ImmediateWindow } from 'src/windows'
import BatchPostForm from './forms/BatchPostForm'
import { ControlContext } from 'src/providers/ControlContext'

const BatchPost = () => {
  const { platformLabels } = useContext(ControlContext)

  return <ImmediateWindow titleName={platformLabels.BatchPost} Component={BatchPostForm} />
}

export default BatchPost
