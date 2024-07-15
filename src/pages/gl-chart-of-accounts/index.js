import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

import { ResourceIds } from 'src/resources/ResourceIds'
import ChartOfAccountsForm from './forms/ChartOfAccountsForm'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ChartOfAccounts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: GeneralLedgerRepository.ChartOfAccounts.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    search,
    clear,
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page,
    datasetId: ResourceIds.ChartOfAccounts,
    search: {
      endpointId: GeneralLedgerRepository.ChartOfAccounts.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ options = {}, qry }) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: GeneralLedgerRepository.ChartOfAccounts.snapshot,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=${qry}`
    })
  }

  const columns = [
    {
      field: 'accountRef',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    },
    {
      field: 'activeStatusName',
      headerName: _labels.status,
      flex: 1
    }
  ]

  const del = async obj => {
    try {
      await postRequest({
        extension: GeneralLedgerRepository.ChartOfAccounts.del,
        record: JSON.stringify(obj)
      })

      invalidate()
      toast.success('Record Deleted Successfully')
    } catch (err) {}
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: ChartOfAccountsForm,
      props: {
        labels: _labels,
        maxAccess: access,
        recordId: recordId ? recordId : null
      },
      width: 500,
      height: 540,
      title: _labels.chartOfAccount
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data ?? { list: [] }}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ChartOfAccounts
