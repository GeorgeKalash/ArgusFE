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
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
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
      props: { taskInfo, maxAccess, labels },
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
          name='table'
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
