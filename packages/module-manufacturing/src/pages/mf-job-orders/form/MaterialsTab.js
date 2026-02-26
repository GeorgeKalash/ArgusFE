import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function MaterialsTab({ store, maxAccess, labels }) {
  const jobMaterials = store?.jobMaterials || []

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'itemCategoryName',
      headerName: labels.category,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'loss',
      headerName: labels.loss,
      flex: 1,
      type: 'number'
    },
    {
      field: 'unitCost',
      headerName: labels.unitCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netCost',
      headerName: labels.netCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'isMetal',
      headerName: labels.isMetal,
      flex: 0.6,
      type: 'checkbox'
    }
  ]

  const totQty = jobMaterials?.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row?.qty?.toString().replace(/,/g, '')) || 0
    const loss = parseFloat(row?.loss?.toString().replace(/,/g, '')) || 0

    return qtySum + qtyValue - loss
  }, 0)

  return (
    <VertLayout>
      <Grow>
        <Table
          name='materialsTable'
          columns={columns}
          gridData={{ list: jobMaterials }}
          rowId={['itemId']}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <Grid container p={4}>
          <Grid item xs={2}>
            <CustomNumberField name='totalQty' label={labels.totQty} value={totQty} readOnly />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}
