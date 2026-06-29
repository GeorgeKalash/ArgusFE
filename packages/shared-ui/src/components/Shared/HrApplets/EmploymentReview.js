import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const EmploymentReview = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.EmploymentReview.qry,
    datasetId: ResourceIds.EmploymentReview
  })

  useSetWindow({ title: labels.employmentReview, window })

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 2
    },
    {
      field: 'nextReviewDate',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: HRDashboardRepository.EmploymentReview.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='employmentReview'
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

EmploymentReview.width = 700
EmploymentReview.height = 400

export default EmploymentReview
