import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import SyncSalesTransactionForm from './Forms/SyncSalesTrxForm'

const SyncSalesTransaction = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.SyncSalesTrx}
      labelKey={'SyncSalesTrx'}
      Component={SyncSalesTransactionForm}
      height={350}
    />
  )
}

export default SyncSalesTransaction
