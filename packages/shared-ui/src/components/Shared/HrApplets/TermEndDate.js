import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const TermEndDate = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.TermEndDate.qry,
    datasetId: ResourceIds.TermEndDate
  })

  useSetWindow({ title: labels.termEndDate, window })

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 2
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: HRDashboardRepository.TermEndDate.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='TermEndDate'
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

TermEndDate.width = 700
TermEndDate.height = 400

export default TermEndDate
