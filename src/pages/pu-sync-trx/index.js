import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import syncPurchaseTrx from './Form/syncPurchaseTrx'

const SyncJobOrders = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.SyncPurchaseTrx} labelKey={'syncPurchaseTrx'} Component={syncPurchaseTrx} />
  )
}

export default SyncJobOrders
