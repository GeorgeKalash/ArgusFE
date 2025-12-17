import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const ItemPromotion = props => {
  const { invoiceId, window } = props
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.ItemPromotion, window })

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

ItemPromotion.width = 1330
ItemPromotion.height = 720

export default ItemPromotion
