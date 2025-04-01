import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CbBankAccountsForm from './forms/CbBankAccountsForm'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const CbBankAccounts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CashBankRepository.CbBankAccounts.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_type=1&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CbBankAccounts.qry
  })

  const {
    query: { data },
    labels: labels,
    filterBy,
    clearFilter,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.CbBankAccounts.qry,
    datasetId: ResourceIds.CbBankAccounts,
    filter: {
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    return await getRequest({
      extension: CashBankRepository.CbBankAccounts.snapshot,
      parameters: `_type=1&_filter=${filters.qry}`
    })
  }

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'accountNo',
      headerName: labels.accountNo,
      flex: 1
    },
    {
      field: 'bankName',
      headerName: labels.bankName,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: labels.currencyName,
      flex: 1
    },
    {
      field: 'IBAN',
      headerName: labels.IBAN,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.statusName,
      flex: 1
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
      field: 'groupName',
      headerName: labels.groupName,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const popup = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: CashBankRepository.CbBankAccounts.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  function openForm(recordId) {
    stack({
      Component: CbBankAccountsForm,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        maxAccess: access,
        invalidate: invalidate
      },
      width: 600,
      height: 600,
      title: labels.CbBankAccounts
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={labels}
          inputSearch={true}
          previewReport={ResourceIds.CbBankAccounts}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={popup}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default CbBankAccounts
