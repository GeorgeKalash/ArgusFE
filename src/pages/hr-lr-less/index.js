import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import LeaveRequestForm from './forms/LeaveRequestForm'
import { useWindow } from 'src/windows'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'

const LeaveRequest = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: LoanManagementRepository.LeaveRequest.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_size=50&_filter=&_sortBy=recordId&_multiDayLeave=1&_params=${
        params || ''
      }`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LoanManagementRepository.LeaveRequest.page,
    datasetId: ResourceIds.LeaveRequest,
    filter: {
      filterFn: fetchWithFilter,
      default: { _multiDayLeave: 1 }
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: LoanManagementRepository.LeaveRequest.snapshot,
        parameters: `_filter=${filters.qry}&_multiDayLeave=1`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.LeaveRequest,
    action: openForm
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'employeeRef',
      headerName: labels.employeeRef,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employeeName,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.startDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.endDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'actualReturnDate',
      headerName: labels.actualReturnDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'leaveDays',
      headerName: labels.leaveDays,
      flex: 1
    },
    {
      field: 'ltName',
      headerName: labels.lateDays,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    }
  ]

  const add = () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: LeaveRequestForm,
      props: {
        labels,
        recordId,
        access
      },
      width: 800,
      height: 500,
      title: labels.title
    })
  }

  const del = async obj => {
    await postRequest({
      extension: LoanManagementRepository.LeaveRequest.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'LMLR'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
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

export default LeaveRequest
