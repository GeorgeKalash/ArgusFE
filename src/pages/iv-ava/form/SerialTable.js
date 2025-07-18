import { useContext, useEffect, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const SerialTable = ({ labels, obj, access }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.AvailabilitySerial.qry,
      parameters: `_itemId=${obj.itemId}&_siteId=${obj.siteId}&_srlNo=&_startAt=0&_pageSize=50`
    })
    setData(response)
  }

  const { refetch, paginationParameters } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.AvailabilitySerial.qry
  })

  useEffect(() => {
    fetchGridData()
  }, [])

  const columns = [
    {
      field: 'srlNo',
      headerName: labels.serialNo,
      flex: 1
    },
    {
      field: 'weight',
      headerName: labels.weight,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.pieces,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='serial'
          columns={columns}
          gridData={data}
          rowId={['sku']}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default SerialTable
