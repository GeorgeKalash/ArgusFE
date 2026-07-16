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
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import LeavePaymentForm from './Forms/LeavePaymentForm'

const LeavePayment = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PayrollRepository.LeavePayment.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_employeeId=0`
    })

    return { ...response, _startAt }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: PayrollRepository.LeavePayment.snapshot,
      parameters: `_filter=${qry}&_size=30&_startAt=0&_employeeId=0&_lsId=0`
    })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate,
    search,
    clear
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.LeavePayment.page,
    datasetId: ResourceIds.LeavePayment,
    search: {
      endpointId: PayrollRepository.LeavePayment.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const columns = [
    {
      field: 'paymentRef',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employeeName,
      flex: 2
    },
    {
      field: 'lsName',
      headerName: labels.leaveSchedule,
      flex: 1
    },
    {
      field: 'ltName',
      headerName: labels.leaveType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'effectiveDate',
      headerName: labels.effectiveDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'hours',
      headerName: labels.hours,
      flex: 1,
      type: 'number'
    }
  ]

  const add = () => openForm()

  const edit = obj => openForm(obj?.recordId)

  const del = async obj => {
    await postRequest({
      extension: PayrollRepository.LeavePayment.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: LeavePaymentForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 800,
      height: 700,
      title: labels.LeavePayment
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={maxAccess}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
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
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default LeavePayment