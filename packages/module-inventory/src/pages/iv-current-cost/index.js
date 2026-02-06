import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const CurrentCost = () => {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: InventoryRepository.CurrentCost.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=itemId&_size=50&_params=${
        params || ''
      }`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    paginationParameters,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.CurrentCost.qry,
    datasetId: ResourceIds.CurrentCosts,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: InventoryRepository.CurrentCost.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 1
    },
    {
      field: 'categoryName',
      headerName: _labels.categoryName,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.groupName,
      flex: 1
    },
    {
      field: 'currentCost',
      headerName: _labels.currentCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'lastCost',
      headerName: _labels.lastCost,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} reportName={'IVCOS'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CurrentCost
