import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import LineItemCapacityForm from './forms/LineItemCapacityForm'

const LineItemCapacity = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ManufacturingRepository.LineItemCapacity.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    refetch,
    access,
    invalidate,
    paginationParameters,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LineItemCapacity.page,
    datasetId: ResourceIds.LineItemCapacity,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'classRef',
      headerName: labels.prodClass,
      flex: 1
    },
    {
      field: 'lineRef',
      headerName: labels.lineRef,
      flex: 1
    },
    {
      field: 'fullCapacityWgtPerHr',
      headerName: labels.fullCapacity,
      flex: 1,
      type: 'number'
    },
    {
      field: 'preparationHrs',
      headerName: labels.startStopHrs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'nbOfLabors',
      headerName: labels.nbLabors,
      flex: 1,
      type: 'number'
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.LineItemCapacity.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(obj) {
    stack({
      Component: LineItemCapacityForm,
      props: {
        labels,
        access,
        obj
      },
      width: 750,
      height: 500,
      title: labels.lineItemCapacity
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFLIT'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          pageSize={50}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default LineItemCapacity
