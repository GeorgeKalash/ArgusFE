import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const EmployeeRightToWork = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.EmpRTW.qry,
    datasetId: ResourceIds.EmployeeRightToWork
  })

  useSetWindow({ title: labels.employeeRightToWork, window })

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'expiryDate',
      headerName: labels.expiryDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'positionName',
      headerName: labels.position,
      flex: 1
    },
    {
      field: 'departmentName',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'departmentName',
      headerName: labels.documentName,
      flex: 1
    },
    {
      field: 'documentRef',
      headerName: labels.documentRef,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: HRDashboardRepository.EmpRTW.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='employeeRightToWork'
          maxAccess={access}
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

EmployeeRightToWork.width = 1000
EmployeeRightToWork.height = 500

export default EmployeeRightToWork
