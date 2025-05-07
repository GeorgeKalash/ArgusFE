import { useContext, useState, useEffect } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const SerialTable = ({ labels, itemId }) => {
  const { getRequest } = useContext(RequestsContext)
  const [tableData, setTableData] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.AvailabilitySerial.page,
      parameters: `_itemId=${itemId}&_siteId=0&_srlNo=0&_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    setTableData({ ...response, _startAt: _startAt })

    return { ...response, _startAt: _startAt }
  }

  const { refetch, paginationParameters } = useResourceQuery({
    datasetId: ResourceIds.AvailabilitiesCrossTab,
    queryFn: fetchGridData,
    endpointId: InventoryRepository.AvailabilitySerial.page
  })

  useEffect(() => {
    setTableData([])
    refetch()
  }, [itemId])

  const columns = [
    {
      field: 'srlNo',
      headerName: labels.serialNo,
      flex: 1
    },
    {
      field: 'weight',
      headerName: labels.weight,
      flex: 1,
      type: 'number'
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
          gridData={tableData}
          rowId={['srlNo']}
          isLoading={true}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          name='avaSerial'
        />
      </Grow>
    </VertLayout>
  )
}

export default SerialTable
