import { useContext, useEffect, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'

const AvailabilityForm = ({ labels, recordId: srlNo, access }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.AvailabilitySerial.qry,
      parameters: `_itemId=0&_siteId=0&_srlNo=${srlNo}&_startAt=0&_pageSize=50`
    })

    const filteredList = response.list.filter(item => item.pcs > 0)
    setData({ list: filteredList })
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
      field: 'siteRef',
      headerName: labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.siteName,
      flex: 2
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
    },
    {
      field: 'lastTrxDate',
      type: 'date',
      headerName: labels.lastTrxDate,
      flex: 2
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

export default AvailabilityForm
