import { DataGrid } from 'src/components/Shared/DataGrid'
import Table from 'src/components/Shared/Table'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const BarcodeForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest } = useContext(RequestsContext)

  const columns = [
    {
      field: 'barcode',
      headerName: labels.barcode,
      flex: 1
    },
    {
      field: 'muName',
      headerName: labels.msUnit,
      flex: 1
    },
    {
      field: 'defaultQty',
      headerName: labels.defaultQty,
      flex: 1
    },
    {
      field: 'scaleDescription',
      headerName: labels.scaleDescription,
      flex: 1
    },
    {
      field: 'posDescription',
      headerName: labels.posDescription,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: labels.isInactive,
      flex: 1,
      type: 'checkbox'
    }
  ]

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.Barcode.qry,
      parameters: `_itemId=${recordId}&_pageSize=50&_startAt=0`
    })

    return response
  }

  const {
    query: { data },
    labels: _labels,
    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.Items,
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Barcode.qry
  })

  return (
    <VertLayout>
      <Fixed></Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={'barcode'}
          isLoading={false}
          pageSize={50}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default BarcodeForm
