import { useContext, useState, useEffect } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'

const SerialForm = ({ labels, itemId }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.AvailabilitySerial.qry,
      parameters: `_itemId=${itemId}&_siteId=0&_srlNo=0&_startAt=0&_pageSize=10`
    })
    setData(response)
  }

  const { refetch, access, paginationParameters } = useResourceQuery({
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
      field: 'siteRef',
      headerName: labels.site,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['srlNo']}
          isLoading={false}
          pageSize={10}
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
