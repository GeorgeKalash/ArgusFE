import React, { useContext, useState } from 'react'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Fixed } from './Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '../Inputs/CustomNumberField'

const InventoryTransaction = props => {
  const { recordId, functionId } = props
  const { getRequest } = useContext(RequestsContext)
  const [extendedCosts, setExtendedCosts] = useState(0)

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
      const amt = item.amount == null ? 0 : item.amount;
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
            <CustomNumberField
              name='extendedCosts'
              label={_labels.extendedCosts}
              value={extendedCosts}
              readOnly
            />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}

export default InventoryTransaction
