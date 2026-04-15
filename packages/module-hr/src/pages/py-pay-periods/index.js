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

export default function PayPeriods () {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PayrollRepository.Years.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }
  
  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.Years.qry,
    datasetId: ResourceIds.PayPeriod
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: labels.year,
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
    }
  ]

  const add = async () => {
    await openForm()
  }

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
        <GridToolbar onAdd={add} maxAccess={access} />
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
