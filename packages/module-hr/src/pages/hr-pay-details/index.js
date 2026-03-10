import { useContext } from 'react'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import PayrollDetailsWindow from './Windows/PayrollDetailsWindow'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

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
