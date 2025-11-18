import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import SyncJobOrderRoutingForm from './Form/SyncJobOrderRoutingForm'

const SyncJobOrderRouting = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.SyncJobOrderRouting}
      labelKey={'syncJobOrderRouting'}
      Component={SyncJobOrderRoutingForm}
      height={250}
    />
  )
}

export default SyncJobOrderRouting
