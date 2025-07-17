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
import LMOpeningBalancesForm from './forms/LMOpeningBalancesForm'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const LmObaPage = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: LoanManagementRepository.LeaveManagementFilters.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LoanManagementRepository.LeaveManagementFilters.page,
    datasetId: ResourceIds.LMOpeningBalances
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: labels.fiscalYear,
      flex: 1
    },
    {
      field: 'employeeRef',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'leaveScheduleRef',
      headerName: labels.leaveSchedule,
      flex: 1
    },
    {
      field: 'days',
      headerName: labels.days,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: LMOpeningBalancesForm,
      props: {
        labels,
        recordId,
        maxAccess: access,
        recordId: recordId ? String(employeeId * 100) + String(fiscalYear * 10) + String(lsId) : null
      },
      width: 500,
      height: 500,
      title: labels.leaveSchedule
    })
  }

  const del = async obj => {
    await postRequest({
      extension: LoanManagementRepository.LeaveManagementFilters.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'LMOBA'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default LmObaPage
