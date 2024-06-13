import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { formatDateDefault } from 'src/lib/date-helper'
import { getFormattedNumber } from 'src/lib/numberField-helper'

const FinancialTransaction = ({ formValues }) => {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData() {
    return await getRequest({
      extension: FinancialRepository.FinancialTransaction.qry,
      parameters: `_functionId=${formValues.functionId}&_recordId=${formValues.recordId}`
    })
  }

  const {
    query: { data },
    labels: labels,

    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.FinancialTransaction.qry,
    datasetId: ResourceIds.FinancialTransaction
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
      valueGetter: ({ row }) => formatDateDefault(row?.date)
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      valueGetter: ({ row }) => getFormattedNumber(row?.amount)
    },
    {
      field: 'baseAmount',
      headerName: labels.amount,
      flex: 1,
      valueGetter: ({ row }) => getFormattedNumber(row?.baseAmount)
    },
    {
      field: 'accountRef',
      headerName: labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: labels.accountName,
      flex: 1
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

export default FinancialTransaction
