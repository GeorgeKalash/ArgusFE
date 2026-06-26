import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const TodaysLeave = ({index, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const endpoint = index == 0
    ? HRDashboardRepository.PaidLeave.qry
    : HRDashboardRepository.UnpaidLeave.qry

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: endpoint,
    datasetId: ResourceIds.TodaysLeaves
  })

  useSetWindow({ title: index == 0 
    ? `${labels.todaysLeave} - ${labels.paidLeave}`
    : `${labels.todaysLeave} - ${labels.unpaidLeave}`, window })

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'positionName',
      headerName: labels.position,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.from,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.to,
      flex: 1,
      type: 'date'
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: endpoint,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='todaysLeave'
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

TodaysLeave.width = 1000
TodaysLeave.height = 500

export default TodaysLeave
