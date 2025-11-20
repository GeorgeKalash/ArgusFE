import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function JobMaterialsForm({ store, access, labels }) {
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
          maxAccess={access}
          pagination={false}
        />
      </Grow>

      <Fixed>
        <Grid
          container
          spacing={1}
          p={3}
          sx={{
            justifyContent: 'flex-end'
          }}
        >
          <Grid item xs={1.5}>
            <CustomNumberField
              name='totalIssued'
              label={labels.totalIssued}
              value={totalIssued}
              maxAccess={access}
              readOnly
            />
          </Grid>
          <Grid item xs={1.5}>
            <CustomNumberField
              name='totalReturned'
              label={labels.totalReturned}
              value={totalReturned}
              maxAccess={access}
              readOnly
            />
          </Grid>
          <Grid item xs={1.5}>
            <CustomNumberField
              name='totalLoss'
              label={labels.totalLoss}
              value={totalLoss}
              maxAccess={access}
              readOnly
            />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}
