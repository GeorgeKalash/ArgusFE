import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import RoutingWindow from './Windows/RoutingWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const Routings = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Routing.page,
    datasetId: ResourceIds.Routings,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'lineRef',
      headerName: labels.lineId,
      flex: 1
    },
    {
      field: 'lineName',
      headerName: labels.lineName,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.Routing.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ManufacturingRepository.Routing.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.Routing.del,
      record: JSON.stringify(obj)
    })

    invalidate()
    toast.success(platformLabels.Deleted)
  }

  async function openForm(recordId) {
    stack({
      Component: RoutingWindow,
      props: {
        labels,
        access,
        recordId
      },
      width: 800,
      height: 630,
      title: labels.routing
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFRTN'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default Routings
