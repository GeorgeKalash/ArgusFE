import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { formatDateDefault } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const CashTransaction = props => {
  const { recordId, functionId } = props
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.CashTransaction.qry,
    datasetId: ResourceIds.CashTransactions
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: _labels.function,
      flex: 1
    },
    ,
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'currencyRef',
      headerName: _labels.currencyRef,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: _labels.BaseAmount,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: CashBankRepository.CashTransaction.qry,
      parameters: `_recordId=${recordId}&_functionId=${functionId}`
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

export default CashTransaction
