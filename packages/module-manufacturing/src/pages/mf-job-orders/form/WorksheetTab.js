import { useEffect, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Grid } from '@mui/material'
import WorksheetWindow from '../../mf-worksheet/window/WorksheetWindow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

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
      field: 'rmQty',
      headerName: labels.rmQty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'wipPcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
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

  const totalPcs = (list || []).reduce(
    (sum, item) => sum + (item.wipPcs || 0),
    0
  );

  const totalQty = (list || []).reduce(
    (sum, item) => sum + (item.rmQty || 0),
    0
  );

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
      <Fixed>
        <Grid container spacing={2} p={2}>
          <Grid item xs={7}/>
          <Grid item xs={2}>
            <CustomNumberField
                label={labels.totalQty}
                value={totalQty}
                readOnly
                align='right'
              />
          </Grid>
          <Grid item xs={2}>
            <CustomNumberField
                label={labels.totalPcs}
                value={totalPcs}
                readOnly
                align='right'
              />
          </Grid>
          <Grid item xs={1}/>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}
