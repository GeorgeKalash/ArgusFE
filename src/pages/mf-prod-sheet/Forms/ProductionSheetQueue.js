import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function ProductionSheetQueue({ recordId, maxAccess, labels }) {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    datasetId: ResourceIds.ProductionSheet,
    endpointId: ManufacturingRepository.ProductionSheetQueue.qry
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: labels.function,
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
    return await getRequest({
      extension: ManufacturingRepository.ProductionSheetQueue.qry,
      parameters: `_psId=${parseInt(recordId)}`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table columns={columns} gridData={data} rowId={['itemId']} pagination={false} maxAccess={maxAccess} />
      </Grow>
    </VertLayout>
  )
}
