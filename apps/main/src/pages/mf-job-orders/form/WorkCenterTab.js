import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'

const WorkCenterTab = ({ labels, maxAccess, store }) => {
  const { getRequest } = useContext(RequestsContext)
  const { recordId } = store

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    return await getRequest({
      extension: ManufacturingRepository.JobWorkCenter.qry,
      parameters: `_jobId=${recordId}`
    })
  }

  const {
    query: { data },
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: !!recordId,
    endpointId: ManufacturingRepository.JobWorkCenter.qry,
    datasetId: ResourceIds.MFJobOrders,
    params: { disabledReqParams: true, maxAccess },
  })

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
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='workCenterTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pageSize={50}
          pagination={false}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default WorkCenterTab
