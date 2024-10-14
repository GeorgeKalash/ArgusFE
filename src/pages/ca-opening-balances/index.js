import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import OpeningBalanceForm from './form/OpeningBalanceForm'
import { getFormattedNumber } from 'src/lib/numberField-helper'

const OpeningBalance = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CashBankRepository.OpeningBalance.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    paginationParameters,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.OpeningBalance.page,
    datasetId: ResourceIds.OpeningBalance
  })

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.OpeningBalance.page
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: _labels.fiscalYear,
      flex: 1
    },
    {
      field: 'cashAccountName',
      headerName: _labels.accountName,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: _labels.currencyRef,
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
      headerName: _labels.baseAmount,
      flex: 1,
      type: 'number'
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: CashBankRepository.OpeningBalance.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: OpeningBalanceForm,
      props: {
        labels: _labels,
        record: record,

        recordId: record
          ? String(record.fiscalYear * 1000) + String(record.accountId * 100) + String(record.currencyId * 10)
          : null
      },
      width: 600,
      height: 430,
      title: _labels.openingBalance
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['currencyId', 'fiscalYear', 'accountId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default OpeningBalance
