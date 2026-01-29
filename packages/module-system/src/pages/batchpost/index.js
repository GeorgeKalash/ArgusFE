import React, { useContext } from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import BatchPostForm from './forms/BatchPostForm'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const BatchPost = () => {
  const { platformLabels } = useContext(ControlContext)

  return <ImmediateWindow titleName={platformLabels.BatchPost} Component={BatchPostForm} />
}

export default BatchPost
