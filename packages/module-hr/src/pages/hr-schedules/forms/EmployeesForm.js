import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

export default function Employees({labels, scheduleId, maxAccess}){
  const { getRequest } = useContext(RequestsContext)

//   const {
//     query: { data },
//     paginationParameters,
//     refetch,
//   } = useResourceQuery({
//     queryFn: fetchGridData,
//     endpointId: EmployeeRepository.Employee.qry,
//     datasetId: ResourceIds.AttendanceSchedule
//   })

  async function fetchGridData(options = {}) {
    // const { _startAt = 0, _pageSize = 50 } = options
    // const response = await getRequest({
    //   extension: EmployeeRepository.Employee.qry,
    //   parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    // })

    // return { ...response, _startAt: _startAt }
    return {list:[]}
  }

  const columns = [
    {
      field: 'name.fullName',
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
      <Fixed>
        <GridToolbar maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={{list:[]}}
          rowId={['recordId']}
          paginationType='api'
         // refetch={refetch}
          pageSize={50}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}
