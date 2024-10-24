import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import Table from 'src/components/Shared/Table'

const GateKeeper = () => {
  const { getRequest } = useContext(RequestsContext)

  const { 
    query: { data }, 
    labels: _labels, 
    access,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.GateKeeper
  })

  async function fetchGridData() {
    const response = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_status=2`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        balance: item.qty - (item.qtyProduced ?? 0),
      }))
    }

    return { ...response }
  }

  const columns = [
    {
      field: 'sku',
      headerName: _labels[1],
      flex: 1,
    },
    {
      field: 'qty',
      headerName: _labels[2],
      flex: 1,
    },
    {
      field: 'qtyProduced',
      headerName: _labels.produced,
      flex: 1,
      type: 'number'
    },
    {
      field: 'balance',
      headerName: _labels.balance,
      flex: 1,
      type: 'number'
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 2
    },
    {
      field: 'date',
      label: _labels[6],
      flex: 2,
      type: 'date'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default GateKeeper
