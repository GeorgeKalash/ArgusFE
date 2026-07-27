import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

export default function Employees({labels, scheduleId, maxAccess}){
  const { getRequest } = useContext(RequestsContext)
  const {
    query: { data },
    refetch,
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.Employee.page,
    datasetId: ResourceIds.AttendanceSchedule,
    enabled: Boolean(scheduleId),
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const response = await getRequest({
      extension: EmployeeRepository.Employee.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=8|${scheduleId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'fullName',
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
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='employeesTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationType='api'
          refetch={refetch}
          pageSize={50}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}
