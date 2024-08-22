import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { formatDateDefault } from 'src/lib/date-helper'

const CashEnquiry = () => {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CashBankRepository.CATransaction.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_functionId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.CATransaction.page,
    datasetId: ResourceIds.CATransaction
  })

  const columns = [
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'functionName',
      headerName: _labels.function,
      flex: 1
    },

    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'baseAmount',
      headerName: _labels.BaseAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'cashAccountRef',
      headerName: _labels.cashAccount,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: _labels.currencyRef,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CashEnquiry
