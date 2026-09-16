import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const MergedComponentsForm = ({ labels, maxAccess, components = [] }) => {
  const columns = [
    {
      field: 'imageUrl',
      headerName: labels.image,
      type: 'image',
      flex: 1,
      clickable: true,
      titleField: 'componentSku'
    },
    {
      field: 'componentSku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'componentName',
      headerName: labels.itemName,
      flex: 2
    },
    {
      field: 'qty',
      headerName: labels.componentQty,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='mergedComponents'
          columns={columns}
          gridData={{ list: components }}
          rowId={['componentId']}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default MergedComponentsForm