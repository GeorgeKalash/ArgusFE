import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

export default function UnallocatedOrdersForm({ data, labels, access }) {

  const columnsUnallocatedOrders = [
    {
      field: 'szName',
      headerName: labels.saleZone,
      width: 130
    },
    {
      field: 'reference',
      headerName: labels.reference,
      width: 130
    },
    {
      field: 'date',
      headerName: labels.date,
      type: 'date',
      width: 130
    },
    {
      field: 'clientName',
      headerName: labels.clientName,
      width: 130
    },
    {
      field: 'volume',
      headerName: labels.volume,
      type: 'number',
      width: 130
    },
    {
      field: 'description',
      headerName: labels.notes,
      flex: 1,
      wrapText: true,
      autoHeight: true
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name={'unallocatedOrders'}
          columns={columnsUnallocatedOrders}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pagination={false}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
