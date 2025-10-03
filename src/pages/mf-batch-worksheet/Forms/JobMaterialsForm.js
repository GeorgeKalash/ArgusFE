import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function JobMaterialsForm({ store, maxAccess, labels }) {
  const columns = [
    {
      field: 'jobRef',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'rawMaterialSku',
      headerName: labels.rawMaterialSku,
      flex: 1
    },
    {
      field: 'rawMaterialName',
      headerName: labels.rawMaterialName,
      flex: 1
    },
    {
      field: 'issued',
      headerName: labels.issued,
      flex: 1,
      type: 'number'
    },
    {
      field: 'issued',
      headerName: labels.issued,
      flex: 1,
      type: 'number'
    },
    {
      field: 'loss',
      headerName: labels.loss,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='worksheet'
          columns={columns}
          gridData={{ list: store.batchWorksheetDistributions }}
          rowId={['itemId']}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}
