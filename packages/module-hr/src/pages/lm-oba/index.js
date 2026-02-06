import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import LMOpeningBalancesForm from './forms/LMOpeningBalancesForm'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { useContext } from 'react'
import toast from 'react-hot-toast'

const LmObaPage = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: LoanManagementRepository.OpeningBalances.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LoanManagementRepository.OpeningBalances.page,
    datasetId: ResourceIds.LMOpeningBalances,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: labels.fiscalYear,
      flex: 1
    },
    {
      field: 'employeeRef',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'lsName',
      headerName: labels.leaveSchedule,
      flex: 1
    },
    {
      field: 'days',
      headerName: labels.days,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(obj) {
    stack({
      Component: LMOpeningBalancesForm,
      props: {
        labels,
        obj,
        maxAccess: access
      },
      width: 500,
      height: 500,
      title: labels.leaveSchedule
    })
  }

  const del = async obj => {
    await postRequest({
      extension: LoanManagementRepository.OpeningBalances.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'LMOBA'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default LmObaPage
