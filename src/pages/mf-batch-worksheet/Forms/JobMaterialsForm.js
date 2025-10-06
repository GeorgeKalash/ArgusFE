import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function JobMaterialsForm({ store, maxAccess, labels }) {
  const columns = [
    {
      field: 'jobRef',
      headerName: labels.job,
      flex: 1
    },
    {
      field: 'rawMaterialSku',
      headerName: labels.rmSku,
      flex: 1
    },
    {
      field: 'rawMaterialName',
      headerName: labels.rmName,
      flex: 2
    },
    {
      field: 'variation',
      headerName: labels.variation,
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
      field: 'returned',
      headerName: labels.returned,
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

  const totalIssued = store.batchWorksheetDistributions?.reduce((sum, row) => {
    const value = parseFloat(row?.issued?.toString().replace(/,/g, '')) || 0

    return sum + value
  }, 0)

  const totalReturned = store.batchWorksheetDistributions?.reduce((sum, row) => {
    const value = parseFloat(row?.returned?.toString().replace(/,/g, '')) || 0

    return sum + value
  }, 0)

  const totalLoss = store.batchWorksheetDistributions?.reduce((sum, row) => {
    const value = parseFloat(row?.loss?.toString().replace(/,/g, '')) || 0

    return sum + value
  }, 0)

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

      <Fixed>
        <Grid container spacing={1} p={3}>
          <Grid item xs={7.5}></Grid>
          <Grid item xs={1.5}>
            <CustomNumberField
              name='totalIssued'
              label={labels.totalIssued}
              value={totalIssued}
              maxAccess={maxAccess}
              readOnly
            />
          </Grid>
          <Grid item xs={1.5}>
            <CustomNumberField
              name='totalReturned'
              label={labels.totalReturned}
              value={totalReturned}
              maxAccess={maxAccess}
              readOnly
            />
          </Grid>
          <Grid item xs={1.5}>
            <CustomNumberField
              name='totalLoss'
              label={labels.totalLoss}
              value={totalLoss}
              maxAccess={maxAccess}
              readOnly
            />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}
