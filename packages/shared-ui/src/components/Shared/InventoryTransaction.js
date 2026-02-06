import React, { useContext, useState } from 'react'
import Table from './Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '../Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const InventoryTransaction = props => {
  const { recordId, functionId, window } = props
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const [extendedCosts, setExtendedCosts] = useState(0)

  useSetWindow({ title: platformLabels.InventoryTransaction, window })

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Transaction.qry2,
    datasetId: ResourceIds.InventoryTransaction
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 1
    },
    ,
    {
      field: 'siteName',
      headerName: _labels.site,
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'extendedCost',
      headerName: _labels.extendedCost,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: InventoryRepository.Transaction.qry2,
      parameters: `_recordId=${recordId}&_functionId=${functionId}`
    })
    let totalExtendedCosts = 0

    res.list = res.list.map(item => {
      const amt = item.amount == null ? 0 : item.amount
      item.extendedCost = item.qty * amt

      totalExtendedCosts += item.extendedCost

      return item
    })

    setExtendedCosts(totalExtendedCosts)

    return res
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <Grid container justifyContent='flex-end' sx={{ px: 2, py: 2 }}>
          <Grid item xs={2}>
            <CustomNumberField name='extendedCosts' label={_labels.extendedCosts} value={extendedCosts} readOnly />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}

InventoryTransaction.width = 700

export default InventoryTransaction
