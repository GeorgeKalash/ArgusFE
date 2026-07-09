import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import OpeningWeightForm from './Forms/OpeningWeightForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const OpeningWeight = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: InventoryRepository.OpeningWeight.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    refetch,
    labels,
    filterBy,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.OpeningWeight.page,
    datasetId: ResourceIds.OpeningWeight,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'year',
      headerName: labels.year,
      flex: 1
    },
    {
      field: 'periodName',
      headerName: labels.period,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'avgWeight',
      headerName: labels.avgWeight,
      flex: 1,
      type: 'number'
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.OpeningWeight.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  function openForm(record) {
    stack({
      Component: OpeningWeightForm,
      props: {
        labels,
        maxAccess: access,
        record,
        recordId: record
          ? String(record.year * 100) + String(record.periodId * 10) + record.itemId
          : null,
      },
      width: 500,
      height: 350,
      title: labels.OpeningWeight
    })
  }

  const add = () => openForm()
  const edit = obj => openForm(obj)

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} reportName={'IVOW'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['year', 'periodId', 'itemId']}
          onEdit={edit}
          onDelete={del}
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

export default OpeningWeight