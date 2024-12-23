import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'

const ItemCostHistory = props => {
  const { itemId, obj } = props
  const { getRequest } = useContext(RequestsContext)

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
        <Grid container xs={9} spacing={2} sx={{ p: 2 }}>
          <Grid item xs={6}>
            <CustomTextField label={_labels.sku} value={obj.sku} readOnly />
          </Grid>
          <Grid item xs={5}></Grid>
          <Grid item xs={6}>
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

export default ItemCostHistory
