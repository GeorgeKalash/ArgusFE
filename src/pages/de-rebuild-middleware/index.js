import React from 'react'
import { ImmediateWindow } from 'src/windows'
import RebuildUndeliveredItemsForm from './forms/RebuildUndeliveredItemsForm'
import { ResourceIds } from 'src/resources/ResourceIds'

const RebuildUndeliveredItems = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildUndeliveredItems} labelKey={'rebuildUndeliveredItems'} Component={RebuildUndeliveredItemsForm} />
}

export default RebuildUndeliveredItems
