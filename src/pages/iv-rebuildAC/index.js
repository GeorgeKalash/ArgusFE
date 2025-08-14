import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import RebuildACForm from './Forms/RebuildACForm'

const RebuildActivityCost = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildAC} labelKey={'rebuildAC'} Component={RebuildACForm} />
}

export default RebuildActivityCost