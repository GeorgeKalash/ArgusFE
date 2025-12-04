import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import SalaryForm from './forms/SalaryForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

export default function HrSalary() {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeeChart.page,
    datasetId: ResourceIds.Salaries,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  function mapEmployeeRecords(list = []) {
    return list.map(record => ({
      recordId: record?.parent?.recordId || null,
      reference: record?.parent?.reference || null,
      name: record?.parent?.fullName || null,
      departmentName: record?.department?.name || null,
      positionName: record?.position?.name || null,
      branchName: record?.branch?.name || null,
      scName: record?.scName || null,
      scTypeName: record?.scTypeName || null,
      hireDate: record?.parent?.hireDate || null
    }))
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: EmployeeRepository.EmployeeChart.page,
      parameters: `_startAt=${_startAt}&_size=${_pageSize}&_params=${params}&_sortBy=recordId&_filter=`
    })

    return {
      count: response.count,
      list: mapEmployeeRecords(response?.list),
      _startAt
    }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry) {
      const res = await getRequest({
        extension: EmployeeRepository.EmployeeChart.qry2,
        parameters: `_branchId=0&_filter=${filters.qry}`
      })

      return {
        count: res.count,
        list: mapEmployeeRecords(res?.list)
      }
    }

    return fetchGridData({
      _startAt: pagination._startAt || 0,
      params: filters?.params
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'departmentName',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'positionName',
      headerName: labels.position,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'scName',
      headerName: labels.schedule,
      flex: 1
    },
    {
      field: 'scTypeName',
      headerName: labels.scheduleType,
      flex: 1
    },
    {
      field: 'hireDate',
      headerName: labels.hireDate,
      flex: 1,
      type: 'date'
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(employeeInfo) {
    stack({
      Component: SalaryForm,
      props: {
        employeeInfo,
        maxAccess: access,
        labels
      },
      width: 1000,
      height: 700,
      title: labels.salary
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} reportName={'RT108'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
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
