import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import TaDslForm from './form/TaDslForm'

const FoWax = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.ShitLeave.page,
    datasetId: ResourceIds.ShiftLeave
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.ref,
      flex: 1
    },
    {
      field: 'employeeRef',
      headerName: labels.empRef,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'fromTime',
      headerName: labels.from,
      flex: 0.6
    },
    {
      field: 'toTime',
      headerName: labels.to,
      flex: 0.6
    },
    {
      field: 'duration',
      headerName: labels.duration,
      flex: 1
    },
    {
      field: 'destination',
      headerName: labels.destination,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.statusRelease,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.ShitLeave.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Wax,
    action: openForm,
    hasDT: false
  })

  const add = async () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: TaDslForm,
      props: {
        labels,
        access,
        recordId
      },
      width: 1000,
      height: 550,
      title: labels.duringShiftLeave
    })
  }

  const del = async obj => {
    await postRequest({
      extension: TimeAttendanceRepository.ShitLeave.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default FoWax
