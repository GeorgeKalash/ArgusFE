import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import RebuildACForm from './Forms/RebuildACForm'

const RebuildActivityCost = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildAC} labelKey={'rebuildAC'} Component={RebuildACForm} />
}

export default RebuildActivityCost