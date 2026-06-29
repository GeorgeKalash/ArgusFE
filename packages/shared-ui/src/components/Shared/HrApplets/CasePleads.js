import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const CasePleads = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.CasePleads.qry,
    datasetId: ResourceIds.CasePleads
  })

  useSetWindow({ title: labels.cases, window })

  const columns = [
    {
      field: 'caseRef',
      headerName: labels.caseRef,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'representative',
      headerName: labels.representative,
      flex: 1
    },
    {
      field: 'opponentName',
      headerName: labels.opponent,
      flex: 1
    },
    {
      field: 'comments',
      headerName: labels.comments,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: HRDashboardRepository.CasePleads.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='casePleads'
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

CasePleads.width = 900
CasePleads.height = 500

export default CasePleads
