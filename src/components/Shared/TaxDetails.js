import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const TaxDetails = props => {
  const { taxId, obj } = props
  const { getRequest } = useContext(RequestsContext)

  const vatAmount = (taxDetail, taxItem) => {
    switch (taxDetail.taxBase) {
      case 1:
        return ((taxItem.extendedPrice * taxDetail.amount) / 100).toFixed(2)
      case 2:
        return (taxItem.qty * taxDetail.amount).toFixed(2)
      case 3:
        return (taxItem.basePrice != null ? (taxItem.basePrice * taxItem.qty * taxDetail.amount) / 100 : 0).toFixed(2)
      case 4:
        return (taxItem.baseLaborPrice != null ? (taxItem.baseLaborPrice * taxItem.qty * taxDetail.amount) / 100 : 0).toFixed(2)
      default:
        return null
    }
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.TaxDetailPack.qry,
    datasetId: ResourceIds.TaxDetails
  })

  const columns = [
    {
      field: 'taxCodeRef',
      headerName: _labels.taxCodeRef,
      flex: 1
    },
    {
      field: 'taxCodeName',
      headerName: _labels.taxCodeName,
      flex: 1
    },
    ,
    {
      field: 'taxBaseName',
      headerName: _labels.taxBaseName,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.taxAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'vatAmount',
      headerName: _labels.vatAmount,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: FinancialRepository.TaxDetailPack.qry,
      parameters: `_taxId=${taxId}`
    })

    res.list = res.list.map(item => {
      const vatValue = vatAmount(item, obj)
      item.vatAmount = vatValue

      return item
    })

    return res
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

export default TaxDetails
