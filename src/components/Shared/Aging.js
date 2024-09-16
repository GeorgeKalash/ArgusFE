import { useContext, useState, useEffect } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'

const Aging = ({ recordId, functionId }) => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState({})

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
        extension: FinancialRepository.Apply2.qry,
        parameters: `_fromFunctionId=${functionId}&_fromRecordId=${recordId}`
      })
    else if (
      functionId == SystemFunction.SalesInvoice ||
      functionId == SystemFunction.PurchaseInvoice ||
      functionId == SystemFunction.DebitNote ||
      functionId == SystemFunction.PurchaseReturn
    )
      data = await getRequest({
        extension: FinancialRepository.Apply3.qry,
        parameters: `_toFunctionId=${functionId}&_toRecordId=${recordId}`
      })

    setGridData(data)
  }

  useEffect(() => {
    fetchGridData()
  }, [recordId])

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.Aging
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

export default Aging
