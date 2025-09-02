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
import { useWindow } from 'src/windows'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import LeaveReturnForm from './form/LeaveReturnForm'

const LeaveReturn = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: LoanManagementRepository.LeaveReturn.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_size=5&_multiDayLeave=1&_params=${params || ''}`
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
    endpointId: LoanManagementRepository.LeaveReturn.page,
    datasetId: ResourceIds.LeaveReturn,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.ReturnFromLeave,
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
      field: 'rtName',
      headerName: labels.returnType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },

    {
      field: 'justification',
      headerName: labels.justification,
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
      Component: LeaveReturnForm,
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
      extension: LoanManagementRepository.LeaveReturn.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} reportName={'LMRE'} filterBy={filterBy} />
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

export default LeaveReturn
