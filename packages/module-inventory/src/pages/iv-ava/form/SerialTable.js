import { useContext, useEffect, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

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
