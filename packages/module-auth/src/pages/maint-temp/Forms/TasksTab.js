import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import TasksForm from './TasksForm'

export default function TasksTab({ store, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const recordId = store?.recordId

  async function fetchGridData() {
    const response = await getRequest({
      extension: RepairAndServiceRepository.MaintenanceTemplateTask.qry,
      parameters: `_templateId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.MaintenanceTemplateTask.qry,
    datasetId: ResourceIds.MaintenanceTemplates,
    enabled: !!recordId
  })

  const columns = [
    {
      field: 'taskName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'recurring',
      headerName: labels.recurring,
      flex: 1
    },
    {
      field: 'reminder',
      headerName: labels.reminder,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(taskInfo) {
    stack({
      Component: TasksForm,
      props: { taskInfo: { taskId: taskInfo?.taskId, templateId: recordId }, maxAccess, labels },
      width: 600,
      height: 550,
      title: labels.maintenanceTemplateTask
    })
  }

  const del = async obj => {
    await postRequest({
      extension: RepairAndServiceRepository.MaintenanceTemplateTask.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='MMTTable'
          columns={columns}
          gridData={data}
          rowId={['templateId']}
          onEdit={edit}
          onDelete={del}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}
