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
import ReceiptVoucherForm from './forms/ReceiptVoucherForm'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { Checkbox } from '@mui/material'
import toast from 'react-hot-toast'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

export default function CurrencyTrading() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  function openForm(recordId) {
    stack({
      Component: ReceiptVoucherForm,
      props: {
        labels,
        maxAccess: access,
        recordId: recordId || null
      },
      width: 1000,
      height: 700,
      title: labels.receiptVoucher
    })
  }

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: labels,
    access,
    paginationParameters,
    refetch,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.ReceiptVouchers.page,
    datasetId: ResourceIds.ReceiptVoucher,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FinancialRepository.ReceiptVouchers.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options
    try {
      const response = await getRequest({
        extension: FinancialRepository.ReceiptVouchers.page,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_sortBy=recordId desc`
      })

      return { ...response, _startAt: _startAt }
    } catch (e) {}
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.ReceiptVoucher,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: FinancialRepository.ReceiptVouchers.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success('Record Deleted Successfully')
    } catch (e) {}
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  const columns = [
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
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
      field: 'cashAccountName',
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
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'isVerified',
      headerName: labels.isVerified,
      type: 'checkbox'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'FIRV'}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          onEdit={edit}
          onDelete={del}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          isLoading={false}
          refetch={refetch}
          paginationParameters={paginationParameters}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
