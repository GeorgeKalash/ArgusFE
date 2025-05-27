import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import SyncJobOrdersForm from './Form/SyncJobOrdersForm'

const SyncJobOrders = () => {
  return <ImmediateWindow datasetId={ResourceIds.SyncMFTrx} labelKey={'syncJobOrders'} Component={SyncJobOrdersForm} />
}

export default SyncJobOrders
