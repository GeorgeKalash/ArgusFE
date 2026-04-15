import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'

export default function FiscalPeriodList ({fiscalYear}) {
    
   
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData() {

    const response = await getRequest({
      extension: PayrollRepository.Period.qry,
      parameters: `_year=${fiscalYear}&_salaryType=${5}&_status=0`
    })

    return response
  }
  
  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.Years.page,
    datasetId: ResourceIds.PayPeriod
  })

  const columns = [
    {
      field: 'periodId',
      headerName: labels.year,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.from,
      flex: 2,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.to,
      flex: 2,
      type: 'date'
    }
  ]

  const edit = obj => {
    openForm(obj.recordId)
  }

  async function openForm(recordId) {
    // stack({
    // Component: ResignationReqForm,
    // props: {
    //     recordId,  
    // }
    // })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='year'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pageSize={50}
          refetch={refetch}
          onEdit={edit}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
