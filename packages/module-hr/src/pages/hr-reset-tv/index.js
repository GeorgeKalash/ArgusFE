import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResetTVForm from './Forms/ResetTVForm'

const ResetTV = () => {
  return <ImmediateWindow datasetId={ResourceIds.TimeVariation} labelKey={'resetTV'} Component={ResetTVForm} />
}

export default ResetTV
