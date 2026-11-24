import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function ItemDetailsTable ({ row, labels, maxAccess }) {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
  } = useResourceQuery({
    queryFn: fetchGridData,
    datasetId: ResourceIds.ProductionSummary,
    endpointId: ManufacturingRepository.ProductionSummaryDetails.qry,
    enabled: Boolean(row?.rsId)
  })

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1.5
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    if (!row?.itemId) return
    
    return await getRequest({
      extension: ManufacturingRepository.ProductionSummaryDetails.qry,
      parameters: `_summaryId=${row?.rsId}&_itemId=${row?.itemId}`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='itemsTable'
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}