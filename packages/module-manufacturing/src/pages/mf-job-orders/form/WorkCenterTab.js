import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const WorkCenterTab = ({ labels, maxAccess, store }) => {
  const columns = [
    {
      field: 'workCenterRef',
      headerName: labels.workCenterRef,
      flex: 1
    },
    {
      field: 'workCenterName',
      headerName: labels.workCenterName,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      type: 'badge',
      family: 'document',
      valueField: 'status',
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='workCenterTable'
          columns={columns}
          gridData={{ list: store?.jobWorkCenters || [] }}
          rowId={['recordId']}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default WorkCenterTab
