import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import Table from 'src/components/Shared/Table'

const ActivitiesTab = ({ data, pagination, refetch, access, labels: _labels }) => {
  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: _labels.function,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    },
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={pagination}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ActivitiesTab
