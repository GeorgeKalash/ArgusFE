import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const FinancialTransaction = ({ formValues, functionId, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.financialTransaction, window })

  async function fetchGridData() {
    return await getRequest({
      extension: FinancialRepository.FinancialTransaction.qry,
      parameters: `_functionId=${formValues.functionId || functionId}&_recordId=${formValues.recordId}`
    })
  }

  const {
    query: { data },
    labels: labels,
    access
  } = useResourceQuery({
    endpointId: FinancialRepository.FinancialTransaction.qry,
    datasetId: ResourceIds.FinancialTransaction,
    filter: {
      filterFn: fetchGridData,
      default: { functionId }
    }
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
      field: 'baseAmount',
      headerName: labels.baseAmount,
      flex: 1,
      type: 'number'
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
FinancialTransaction.width = 1000
FinancialTransaction.height = 620

export default FinancialTransaction
