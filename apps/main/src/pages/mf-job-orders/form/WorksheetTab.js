import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import WorksheetWindow from 'src/pages/mf-worksheet/window/WorksheetWindow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

export default function WorksheetTab({ store, maxAccess, labels }) {
  const { getRequest } = useContext(RequestsContext)
  const recordId = store?.recordId
  const { stack } = useWindow()

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(recordId),
    endpointId: ManufacturingRepository.Worksheet.qry2,
    params: { disabledReqParams: true, maxAccess },
    datasetId: ResourceIds.MFJobOrders
  })

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
      field: 'jobRef',
      headerName: labels.jobRef,
      flex: 1
    },
    {
      field: 'wcName',
      headerName: labels.workCenter,
      flex: 1
    },
    {
      field: 'laborName',
      headerName: labels.labor,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    return await getRequest({
      extension: ManufacturingRepository.Worksheet.qry2,
      parameters: `_jobId=${recordId}`
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: WorksheetWindow,
      props: {
        recordId,
        joInvalidate: invalidate,
      }
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='worksheetTable'
          columns={columns}
          gridData={data}
          onEdit={edit}
          rowId={['worksheetId']}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}
