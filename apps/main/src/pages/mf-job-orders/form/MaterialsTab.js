import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ManufacturingRepository } from '@argus/repositories/repositories/ManufacturingRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function MaterialsTab({ store, maxAccess, labels }) {
  const { getRequest } = useContext(RequestsContext)
  const recordId = store?.recordId

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(recordId),
    endpointId: ManufacturingRepository.JobMaterial.qry,
    params: { disabledReqParams: true, maxAccess },
    datasetId: ResourceIds.MFJobOrders
  })

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

  const totQty = data?.list?.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row?.qty?.toString().replace(/,/g, '')) || 0
    const loss = parseFloat(row?.loss?.toString().replace(/,/g, '')) || 0

    return qtySum + qtyValue - loss
  }, 0)

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    const res = await getRequest({
      extension: ManufacturingRepository.JobMaterial.qry,
      parameters: `_jobId=${recordId}&_seqNo=0`
    })

    res.list = res?.list?.map(item => ({
      ...item,
      netCost: parseFloat(item?.qty * item?.unitCost).toFixed(2)
    }))

    return res
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='materialsTable'
          columns={columns}
          gridData={data}
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
