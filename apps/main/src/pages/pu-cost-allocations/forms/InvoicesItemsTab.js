import React, { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { CostAllocationRepository } from '@argus/repositories/repositories/CostAllocationRepository'
import Table from '@argus/shared-ui/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'

const InvoicesItemsTab = ({ store, labels, access, setStore }) => {
  const { recordId, invoicesItemsData } = store
  const { getRequest } = useContext(RequestsContext)

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netPrice',
      headerName: labels.netPrice,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: CostAllocationRepository.InvoicesItems.qry,
      parameters: `_invoiceId=0&_caId=${recordId}`
    })
    setStore(prevStore => ({
      ...prevStore,
      invoicesItemsData: res?.count == 0 ? invoicesItemsData : res
    }))

    return res
  }

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CostAllocationRepository.InvoicesItems.qry,
    datasetId: ResourceIds.PuCostAllocation,
    enabled: Boolean(recordId)
  })

  return (
    <VertLayout>
      <Grow>
        <Table
          name='invoicesItemsTable'
          columns={columns}
          gridData={invoicesItemsData}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default InvoicesItemsTab
