import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import WorkOrderWindow from './Window/WorkOrderWindow'

const WorkOrder = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RepairAndServiceRepository.WorkOrder.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: labels,
    invalidate,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.WorkOrder.page,
    datasetId: ResourceIds.WorkOrder
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'equipmentName',
      headerName: labels.equipment,
      flex: 1
    },
    {
      field: 'wotName',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'priorityName',
      headerName: labels.priority,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'progressName',
      headerName: labels.progress,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.WorkOrder,
    action: openForm
  })

  const add = async () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: RepairAndServiceRepository.WorkOrder.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
    x
  }

  function openForm(recordId) {
    stack({
      Component: WorkOrderWindow,
      props: {
        labels,
        recordId,
        access
      },
      width: 1000,
      height: 750,
      title: labels.metals
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default WorkOrder
