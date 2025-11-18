import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import RebuildUndeliveredItemsForm from './forms/RebuildUndeliveredItemsForm'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'

const RebuildUndeliveredItems = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildUndeliveredItems} labelKey={'rebuildUndeliveredItems'} Component={RebuildUndeliveredItemsForm} />
}

export default RebuildUndeliveredItems
