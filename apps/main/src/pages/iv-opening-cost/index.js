import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import OpeningCostForm from './Forms/OpeningCostForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const OpeningCost = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: InventoryRepository.OpeningCost.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=${params || ''}&_sortBy=year desc`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,
    invalidate,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.OpeningCost.qry,
    datasetId: ResourceIds.InventoryOpeningCosts,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'year',
      headerName: _labels.fiscalYear,
      flex: 1
    },
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.item,
      flex: 1
    },
    {
      field: 'periodId',
      headerName: _labels.periodId,
      flex: 1
    },
    {
      field: 'avgCost',
      headerName: _labels.cost,
      flex: 1,
      type: 'number'
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: OpeningCostForm,
      props: {
        labels: _labels,
        record,
        recordId: record ? String(record.year) + String(record.itemId) : null,
        maxAccess: access
      },
      width: 550,
      height: 400,
      title: _labels.OpeningCost
    })
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.OpeningCost.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          labels={_labels}
          maxAccess={access}
          filterBy={filterBy}
          onAdd={add}
          hasSearch={false}
          reportName={'IVOC'}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId', 'year']}
          onEdit={edit}
          onDelete={del}
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

export default OpeningCost
