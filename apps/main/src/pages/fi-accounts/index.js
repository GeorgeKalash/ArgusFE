import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import AccountsWindow from './Windows/AccountsWindow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const MfAccounts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels: _labels,
    filterBy,
    paginationParameters,
    invalidate,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.Account.page,
    datasetId: ResourceIds.Accounts,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FinancialRepository.Account.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: FinancialRepository.Account.page,
      parameters: parameters
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.accountGroup,
      flex: 1
    },
    {
      field: 'typeName',
      headerName: _labels.type,
      flex: 1
    }
  ]

  const delAccounts = async obj => {
    await postRequest({
      extension: FinancialRepository.Account.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const addAccounts = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: AccountsWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 450,
      title: _labels.Accounts
    })
  }

  const popup = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={addAccounts} maxAccess={access} reportName={'FIACC'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={popup}
          onDelete={delAccounts}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default MfAccounts
