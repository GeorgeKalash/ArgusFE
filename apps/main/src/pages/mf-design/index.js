import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import MFDesignsWindow from './Windows/MFDesignsWindow'

const Designs = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.Design.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=&_params=${params}&_sortBy=recordId`
    })

    return { ...response, _startAt: _startAt }
  }

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
    endpointId: ManufacturingRepository.Design.page,
    datasetId: ResourceIds.Design,
    filter: {
      filterFn: fetchWithFilter
    }
  })


  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: ManufacturingRepository.Design.snapshot,
        parameters: `_filter=${filters.qry}&_startAt=${pagination._startAt || 0}&_size=${pagination._size || 50}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }
  
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
      field: 'designDate',
      headerName: labels.designDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    },
    {
      field: 'lineRef',
      headerName: labels.productionLine,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: MFDesignsWindow,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 900,
      height: 740,
      title: labels.Designs
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.Design.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'MFDES'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default Designs