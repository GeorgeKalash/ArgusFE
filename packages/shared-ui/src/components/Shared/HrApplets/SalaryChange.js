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

const SalaryChange = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.SalaryChange.qry,
    datasetId: ResourceIds.Salaries
  })

  useSetWindow({ title: labels.salaryChange, window })

  const columns = [
   {
      field: 'employeeInfo',
      headerName: labels.employee,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellRenderer: ({ data }) => {
        const effectiveDate = data?.effectiveDate
          ? formatDateFromApi(data.effectiveDate)
          : null
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{data?.employeeName || ''}</span>
            <span>
              {effectiveDate ? `${formatDateDefault(effectiveDate)}` : ''} 
              {data?.currencyRef || ''} {data?.finalAmount || ''}
            </span>
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
        extension: HRDashboardRepository.SalaryChange.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='SalaryChange'
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

SalaryChange.width = 700
SalaryChange.height = 450

export default SalaryChange
