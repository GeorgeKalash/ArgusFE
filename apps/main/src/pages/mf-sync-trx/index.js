import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import SyncJobOrdersForm from './Form/SyncJobOrdersForm'

const SyncJobOrders = () => {
  return <ImmediateWindow datasetId={ResourceIds.SyncMFTrx} labelKey={'syncJobOrders'} Component={SyncJobOrdersForm} />
}

export default SyncJobOrders
