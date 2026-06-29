import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'
import { formatEEEEMMMDDYY } from '@argus/shared-domain/src/lib/date-helper'

const EmployeesBirthday = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.EmployeeBirthday.qry,
    datasetId: ResourceIds.EmployeesBirthday
  })

  useSetWindow({ title: labels.birthdays, window })

  const columns = [
    {
      field: 'employeeInfo',
      headerName: labels.employee,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellRenderer: ({ data }) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{data?.employeeName || ''}{data?.age ? ` (${data.age})` : ''}</span>
        <span>{data?.birthDate ? formatEEEEMMMDDYY(data.birthDate) : ''}</span>
        </div>
      )
    },
    {
      field: 'days',
      headerName: labels.daysLeft,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: HRDashboardRepository.EmployeeBirthday.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='employeesBirthday'
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

EmployeesBirthday.width = 1000
EmployeesBirthday.height = 500

export default EmployeesBirthday
