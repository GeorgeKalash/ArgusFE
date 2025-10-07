import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import EmployeeListWindow from './Windows/EmployeeListWindow'

const EmployeeList = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    invalidate,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.Account.page,
    datasetId: ResourceIds.EmployeeFilter,
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
      field: 'image',
      headerName: '',
      flex: 1
    },
    {
      field: 'ref',
      headerName: labels.ref,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'departmentName',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'positionName',
      headerName: labels.position,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'schedule',
      headerName: labels.schedule,
      flex: 1
    },
    {
      field: 'scheduleType',
      headerName: labels.scheduleType,
      flex: 1
    },
    {
      field: 'hireDate',
      headerName: labels.hireDate,
      flex: 1,
      type: 'date'
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.Account.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: EmployeeListWindow,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 1000,
      height: 700,
      title: labels.employee
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'FIACC'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default EmployeeList
