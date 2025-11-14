import { useContext, useEffect, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import WorksheetWindow from 'src/pages/mf-worksheet/window/WorksheetWindow'
import { useWindow } from 'src/windows'

export default function WorksheetTab({ store, maxAccess, labels }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { jobWorksheets, recordId, jobReference } = store || {}
  const [list, setList] = useState([])

  const { refetch } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: false,
    endpointId: ManufacturingRepository.Worksheet.qry2,
    params: { disabledReqParams: true, maxAccess },
    datasetId: ResourceIds.MFJobOrders
  })

  useEffect(() => {
    ;(async function () {
      setList(jobWorksheets)
    })()
  }, [jobWorksheets])

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

    const response = await getRequest({
      extension: ManufacturingRepository.Worksheet.qry2,
      parameters: `_jobId=${recordId}`
    })

    setList(response?.list)
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: WorksheetWindow,
      props: {
        recordId,
        joInvalidate: refetch
      }
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='worksheetTable'
          columns={columns}
          gridData={{
            list: (list || [])?.map(item => ({
              ...item,
              jobRef: jobReference
            }))
          }}
          onEdit={edit}
          rowId={['worksheetId']}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}
