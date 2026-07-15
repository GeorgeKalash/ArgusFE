import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'
import { formatDateFromApi, formatDateDefault } from '@argus/shared-domain/src/lib/date-helper'

const ProbationEnd = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.ProbationEnd.qry,
    datasetId: ResourceIds.Probation
  })

  useSetWindow({ title: labels.probation, window })

  const columns = [
   {
      field: 'employeeInfo',
      headerName: labels.employee,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellRenderer: ({ data }) => {
        const date = data?.date
          ? formatDateFromApi(data.date)
          : null
          
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{data?.employeeName || ''}</span>
            <span>{date ? `${formatDateDefault(date)}` : ''}</span>
          </div>
        )
      }
    },
    {
      field: 'days',
      headerName: labels.daysLeft,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: HRDashboardRepository.ProbationEnd.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='Probation'
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

ProbationEnd.width = 800
ProbationEnd.height = 500

export default ProbationEnd
