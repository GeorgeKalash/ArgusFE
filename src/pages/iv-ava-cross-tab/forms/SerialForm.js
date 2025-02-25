import { useContext, useState, useEffect } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const SerialForm = ({ labels, itemId }) => {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.AvailabilitySerial.qry,
      parameters: `_itemId=${itemId}&_siteId=0&_srlNo=0&_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    refetch,
    paginationParameters
  } = useResourceQuery({
    datasetId: ResourceIds.AvailabilitiesCrossTab,
    queryFn: fetchGridData,
    endpointId: InventoryRepository.AvailabilitySerial.qry
  })

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
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default SerialForm
