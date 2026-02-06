import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ItemCostHistory = props => {
  const { itemId, obj, window } = props
  const { getRequest } = useContext(RequestsContext)

  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.CostHistory, window })

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PurchaseRepository.ItemCostHistory.qry,
    datasetId: ResourceIds.ItemCostHistory
  })

  const columns = [
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'vendorName',
      headerName: _labels.vendor,
      flex: 1
    },
    ,
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'baseLaborPrice',
      headerName: _labels.baseLaborPrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'unitPrice',
      headerName: _labels.unitPrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'markdown',
      headerName: _labels.markdown,
      flex: 1,
      type: 'number'
    },

    {
      field: 'tradeDiscount',
      headerName: _labels.tradeDiscount,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: PurchaseRepository.ItemCostHistory.qry,
      parameters: `_itemId=${itemId}`
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={5}>
            <CustomTextField label={_labels.sku} value={obj.sku} readOnly />
          </Grid>
          <Grid item xs={6}></Grid>
          <Grid item xs={5}>
            <CustomTextField label={_labels.itemName} value={obj.itemName} readOnly />
          </Grid>
        </Grid>
      </Fixed>
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
    </VertLayout>
  )
}

ItemCostHistory.width = 1000

export default ItemCostHistory
