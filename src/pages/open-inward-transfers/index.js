import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext } from 'react'
import CloseForm from '../inward-transfer/forms/CloseForm'

const InwardTransfer = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: labels,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.InwardsTransfer.open,
    datasetId: ResourceIds.OpenInwardTransfers
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.InwardsTransfer.open,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    }
  ]

  const editTransfer = obj => {
    stack({
      Component: CloseForm,
      props: {
        form: obj,
        labels,
        access,
        recordId: obj.recordId
      },
      width: 600,
      title: platformLabels.ApproveFields
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editTransfer}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default InwardTransfer