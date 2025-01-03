import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'

const ItemPromotion = props => {
  const { invoiceId } = props
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PurchaseRepository.ItemPromotion.qry,
    datasetId: ResourceIds.ItemPromotion
  })

  const columns = [
    {
      field: 'promotionTypeName',
      headerName: _labels.promType
    },
    {
      field: 'sku',
      headerName: _labels.sku
    },
    {
      field: 'itemName',
      headerName: _labels.itemName
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      type: 'number'
    },
    {
      field: 'netUnitPrice',
      headerName: _labels.netUnitPrice,
      type: 'number'
    },
    {
      field: 'currentCost',
      headerName: _labels.currentCost,
      type: 'number'
    },
    {
      field: 'netExtendedPrice',
      headerName: _labels.netExtendedPrice,
      type: 'number'
    },
    {
      field: 'extendedCurrentCostInDocumentCurrency',
      headerName: _labels.extendedCurrent,
      type: 'number'
    },
    ,
    {
      field: 'invoicePct',
      headerName: _labels.invoicePct,
      type: 'number'
    },
    {
      field: 'freeOnInvoiceUnitMarkdown',
      headerName: _labels.freeOnInvoiceUnitMarkdown,
      type: 'number'
    },
    {
      field: 'kitPct',
      headerName: _labels.kitPct,
      type: 'number'
    },
    {
      field: 'promotionUnitMarkdown',
      headerName: _labels.promotionUnitMarkdown,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: PurchaseRepository.ItemPromotion.qry,
      parameters: `_invoiceId=${invoiceId}`
    })
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
    </VertLayout>
  )
}

export default ItemPromotion
