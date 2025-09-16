import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import EquipmentTaskForm from './PMTasksForm'

const PMTasksTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { recordId } = store

  async function fetchGridData() {
    const response = await getRequest({
      extension: RepairAndServiceRepository.EquipmentType.qry,
      parameters: `_filter=&_size=30_startAt=0&_equipmentId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    refetch,
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.EquipmentType.qry,
    datasetId: ResourceIds.Equipment
  })

  const columns = [
    {
      field: 'pmtName',
      headerName: labels.taskName,
      flex: 1
    },
    {
      field: 'activeStatusName',
      headerName: labels.statusName,
      flex: 1
    },
    {
      field: 'recurring',
      headerName: labels.recurringDays,
      flex: 1
    },
    {
      field: 'reminder',
      headerName: labels.reminderDays,
      flex: 1
    },
    {
      field: 'tbhEvery',
      headerName: labels.recurringHours,
      flex: 1
    },
    {
      field: 'tbhReminder',
      headerName: labels.reminderHours,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: RepairAndServiceRepository.EquipmentType.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const openForm = (obj) => {
    stack({
      Component: EquipmentTaskForm,
      props: {
        labels,
        maxAccess,
        recordId: recordId,
        pmtId: obj?.pmtId
      },
      width: 650,
      height: 600,
      title: labels.PMTasks
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='pmTasksTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          pagination={false}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default PMTasksTab
