import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
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
