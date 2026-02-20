import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const TaxDetails = props => {
  const { taxId, obj, window } = props
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const useTaxes = Array.isArray(obj?.taxDetails) && obj?.taxDetails?.length > 0
  useSetWindow({ title: platformLabels.TaxDetails, window })

  const vatAmount = (taxDetail, taxItem) => {
    switch (taxDetail.taxBase) {
      case 1:
        return ((taxItem.extendedPrice * taxDetail.amount) / 100).toFixed(2)
      case 2:
        return (taxItem.qty * taxDetail.amount).toFixed(2)
      case 3:
        return (taxItem.basePrice != null ? (taxItem.basePrice * taxItem.qty * taxDetail.amount) / 100 : 0).toFixed(2)
      case 4:
        return (
          taxItem.baseLaborPrice != null ? (taxItem.baseLaborPrice * taxItem.qty * taxDetail.amount) / 100 : 0
        ).toFixed(2)
      default:
        return null
    }
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    enabled: !useTaxes,
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

  const mappedTaxes = useTaxes
  ? {
      list: obj?.taxDetails?.map(t => ({
        ...t,
        amount: t.taxScheduleAmount,   
        vatAmount: t.amount.toFixed(2)        
      }))
    }
  : null

  const gridData = useTaxes ? mappedTaxes : data

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
          gridData={gridData}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

TaxDetails.width = 1000

export default TaxDetails
