import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Table from '@argus/shared-ui/src/components/Shared/Table'

const AvailabilitiesTab = ({ data, pagination, refetch, access, labels: _labels }) => {
  const columns = [
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
      field: 'onHand',
      headerName: _labels.qty,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='availabilities'
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

export default AvailabilitiesTab
