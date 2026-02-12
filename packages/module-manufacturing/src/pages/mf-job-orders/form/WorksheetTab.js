import { useEffect, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import WorksheetWindow from '../../mf-worksheet/window/WorksheetWindow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

export default function WorksheetTab({ store, maxAccess, labels, setRefetchJob }) {

  const { stack } = useWindow()
  const { jobWorksheets, jobReference } = store || {}
  const [list, setList] = useState([])

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

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: WorksheetWindow,
      props: {
        recordId,
        joInvalidate: setRefetchJob
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
