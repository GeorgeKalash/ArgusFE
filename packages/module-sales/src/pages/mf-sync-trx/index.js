import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import SyncJobOrdersForm from './Form/SyncJobOrdersForm'

const SyncJobOrders = () => {
  return <ImmediateWindow datasetId={ResourceIds.SyncMFTrx} labelKey={'syncJobOrders'} Component={SyncJobOrdersForm} />
}

export default SyncJobOrders
