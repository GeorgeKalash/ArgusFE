import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import WorkCentersForm from './forms/WorkCentersForm'

const WorkCenter = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.WorkCenter.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    filterBy,
    labels,
    access,
    paginationParameters,
    refetch,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.WorkCenter.page,
    datasetId: ResourceIds.WorkCenters,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ManufacturingRepository.WorkCenter.snapshot,
        parameters: `_filter=${filters.qry}&_status=0`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
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
      field: 'siteName',
      headerName: labels.sitename,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: labels.siteRef,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plantName,
      flex: 1
    },
    {
      field: 'supervisorName',
      headerName: labels.supervisor,
      flex: 1
    },
    {
      field: 'lineRef',
      headerName: labels.productionLine,
      flex: 1
    },
    {
      field: 'lineName',
      headerName: labels.productionLine,
      flex: 1
    },
    {
      field: 'costCenterName',
      headerName: labels.costCenter,
      flex: 1
    },
    {
      field: 'isSerialCreator',
      headerName: labels.isSerialCreator,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'isInactive',
      headerName: labels.inactive,
      flex: 1,
      type: 'checkbox'
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(record) {
    stack({
      Component: WorkCentersForm,
      props: {
        labels,
        recordId: record?.recordId,
        maxAccess: access
      },
      width: 600,
      height: 550,
      title: labels.workCenter
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.WorkCenter.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          filterBy={filterBy}
          reportName={'MFWCT'}
          previewReport={ResourceIds.WorkCenters}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default WorkCenter
