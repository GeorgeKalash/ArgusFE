import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import RebuildACForm from './Forms/RebuildACForm'

const RebuildActivityCost = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildAC} labelKey={'rebuildAC'} Component={RebuildACForm} />
}

export default RebuildActivityCost