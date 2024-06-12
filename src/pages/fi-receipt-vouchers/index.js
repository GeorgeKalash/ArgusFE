import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { formatDateDefault } from 'src/lib/date-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import ReceiptVoucherForm from './forms/ReceiptVoucherForm'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  function openForm(recordId) {
    stack({
      Component: ReceiptVoucherForm,
      props: {
        labels,
        maxAccess: access,
        recordId
      },
      width: 1200,
      height: 600,
      title: 'Cash Invoice'
    })
  }

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: labels,
    access
  } = useResourceQuery({
    endpointId: FinancialRepository.ReceiptVouchers.snapshot,
    datasetId: SystemFunction.ReceiptVoucher,
    filter: {
      endpointId: FinancialRepository.ReceiptVouchers.snapshot,
      filterFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ options = {}, filters }) {
    return await getRequest({
      extension: FinancialRepository.ReceiptVouchers.snapshot,
      parameters: `_filter=${filters.qry}&_category=1`
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          onAdd={openForm}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={[
            {
              field: 'Date',
              headerName: labels.date,
              flex: 1,
              valueGetter: ({ row }) => formatDateDefault(row?.date)
            },
            {
              field: 'reference',
              headerName: labels.reference,
              flex: 1
            },
            {
              field: 'accountName',
              headerName: labels.accountName,
              flex: 1
            },
            {
              field: 'CashAccount',
              headerName: labels.CashAccount,
              flex: 1
            },
            {
              field: 'amount',
              headerName: labels.amount,
              flex: 1
            },
            {
              field: 'currency',
              headerName: labels.currency,
              flex: 1
            },
            {
              field: 'status',
              headerName: labels.status,
              flex: 1
            },
            {
              field: 'isVerified',
              headerName: labels.isVerified,
              flex: 1
            }
          ]}
          onEdit={obj => {
            openForm(obj.recordId)
          }}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
