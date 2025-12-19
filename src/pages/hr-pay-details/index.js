import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import PayrollDetailsWindow from './Windows/PayrollDetailsWindow'

const PayDetails = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: PayrollRepository.GeneratePayroll.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_sortBy=recordId desc`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.GeneratePayroll.page,
    datasetId: ResourceIds.PayrollDetail,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'asOfDate',
      headerName: labels.asOfDate,
      flex: 1
    },
    {
      field: 'employeeRef',
      headerName: labels.reference,
      flex: 1
    },

    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'departmentName',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'paymentMethodName',
      headerName: labels.payment,
      flex: 1
    },
    {
      field: 'calendarDays',
      headerName: labels.calendarDays,
      flex: 1,
      type: 'number'
    },

    {
      field: 'workingDays',
      headerName: labels.days,
      flex: 1,
      type: 'number'
    },
    {
      field: 'eAmount',
      headerName: labels.entitlements,
      flex: 1,
      type: 'number'
    },
    {
      field: 'dAmount',
      headerName: labels.deduction,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netSalary',
      headerName: labels.net,
      flex: 1,
      type: 'number'
    },
    {
      field: 'cssAmount',
      headerName: labels.css,
      flex: 1,
      type: 'number'
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  async function openForm(obj) {
    stack({
      Component: PayrollDetailsWindow,
      props: {
        labels,
        recordId: obj?.payId,
        seqNo: obj?.seqNo,
        maxAccess: access
      },
      width: 700,
      height: 500,
      title: labels.PayrollDetails
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} reportName={'PYEM'} filterBy={filterBy} hasSearch={false} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          deleteConfirmationType={'strict'}
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

export default PayDetails
