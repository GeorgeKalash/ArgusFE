import { useContext, useEffect, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const SerialForm = ({ labels, maxAccess, itemId, siteId }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])
  console.log(itemId, 'itemId')

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.AvailabilitySerial.qry,
      parameters: `_itemId=${itemId}&_siteId=${siteId}&_srlNo=&_startAt=0&_pageSize=50`
    })
    setData(response)
  }

  useEffect(() => {
    fetchGridData()
  }, [])

  const { refetch, access, paginationParameters } = useResourceQuery({
    datasetId: ResourceIds.AvailabilitiesBySite,
    queryFn: fetchGridData,
    endpointId: InventoryRepository.AvailabilitySerial.qry
  })

  const columns = [
    {
      field: 'srlNo',
      headerName: labels.srlNo,
      flex: 1
    },
    {
      field: 'weight',
      headerName: labels.weight,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1
    }
  ]

  console.log(data, 'dataaaaaaaaaaaaaaaaaaaa')

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
          paginationParameters={paginationParameters}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default SerialForm
