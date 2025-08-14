import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResetTVForm from './Forms/ResetTVForm'

const ResetTV = () => {
  return <ImmediateWindow datasetId={ResourceIds.ResetTimeVariation} labelKey={'resetTV'} Component={ResetTVForm} />
}

export default ResetTV
