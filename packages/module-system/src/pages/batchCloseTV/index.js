import React, { useContext } from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import BatchCloseTVForm from './Forms/BatchCloseForm'

const BatchCloseTV = () => {
  const { platformLabels } = useContext(ControlContext)

  return <ImmediateWindow titleName={platformLabels.BatchCloseTV} Component={BatchCloseTVForm} />
}

export default BatchCloseTV
