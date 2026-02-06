import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import EmployeeListWindow from './Windows/EmployeeListWindow'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

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
    endpointId: EmployeeRepository.EmployeeChart.page,
    datasetId: ResourceIds.EmployeeFilter,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      const res = await getRequest({
        extension: EmployeeRepository.EmployeeChart.qry2,
        parameters: `_filter=${filters.qry}&_branchId=0`
      })
      
      if (res && res?.list) {
        res.list = res?.list.map(item => ({
          ...item,
          hireDate: item?.parent?.hireDate
        }))
      }

      return res
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: EmployeeRepository.EmployeeChart.page,
      parameters: `_startAt=${_startAt}&_size=30&_sortBy=recordId desc&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    if (response && response?.list) {
      response.list = response.list.map(item => ({
        ...item,
        hireDate: item?.parent?.hireDate
      }))
    }

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'pictureUrl',
      headerName: '',
      flex: 1,
      type: 'image'
    },
    {
      field: 'parent.reference',
      headerName: labels.ref,
      flex: 1
    },
    {
      field: 'parent.fullName',
      headerName: labels.name,
      flex: 1,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'department.name',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'position.name',
      headerName: labels.position,
      flex: 1,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'branch.name',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'scName',
      headerName: labels.schedule,
      flex: 1
    },
    {
      field: 'scTypeName',
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
      extension: EmployeeRepository.Employee.del,
      record: JSON.stringify({
        recordId: obj?.parent?.recordId
      })
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
    openForm(obj?.parent?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'RT108'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
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
