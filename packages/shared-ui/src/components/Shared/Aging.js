import { useContext, useState, useEffect } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const Aging = ({ recordId, functionId, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState({})

  const { platformLabels } = useContext(ControlContext)
  useSetWindow({ title: platformLabels.Aging, window })

  async function fetchGridData() {
    let data = {
      list: [],
      count: 0
    }

    if (
      functionId == SystemFunction.ServiceBill ||
      functionId == SystemFunction.ServiceInvoice ||
      functionId == SystemFunction.ReceiptVoucher ||
      functionId == SystemFunction.PaymentVoucher ||
      functionId == SystemFunction.CreditNote ||
      functionId == SystemFunction.SalesReturn ||
      functionId == SystemFunction.MetalReceiptVoucher ||
      functionId == SystemFunction.MetalPaymentVoucher
    )
      data = await getRequest({
        extension: FinancialRepository.Apply.qry2,
        parameters: `_fromFunctionId=${functionId}&_fromRecordId=${recordId}`
      })
    else if (
      functionId == SystemFunction.SalesInvoice ||
      functionId == SystemFunction.PurchaseInvoice ||
      functionId == SystemFunction.DebitNote ||
      functionId == SystemFunction.PurchaseReturn
    )
      data = await getRequest({
        extension: FinancialRepository.Apply.qry3,
        parameters: `_toFunctionId=${functionId}&_toRecordId=${recordId}`
      })

    setGridData(data)
  }

  useEffect(() => {
    fetchGridData()
  }, [recordId])

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.AgingButton
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          sx={{ mb: 3 }}
          columns={columns}
          gridData={gridData}
          rowId={['reference']}
          isLoading={!gridData}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

Aging.width = 1000
Aging.height = 620

export default Aging
