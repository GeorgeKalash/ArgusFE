import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
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
