import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import syncPurchaseTrx from './Form/syncPurchaseTrx'

const SyncJobOrders = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.SyncPurchaseTrx} labelKey={'syncPurchaseTrx'} Component={syncPurchaseTrx} />
  )
}

export default SyncJobOrders
