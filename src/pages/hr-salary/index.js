import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import SalaryForm from './forms/SalaryForm'
import { formatDateFromApi } from 'src/lib/date-helper'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

export default function HrSalary() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    paginationParameters,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeeChart.page,
    datasetId: ResourceIds.HrSalary,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchGridData(options = {}) {
    console.log('qry')
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: EmployeeRepository.EmployeeChart.page,
      parameters: `_startAt=${_startAt}&_size=${_pageSize}&_params=${params}&_sortBy=recordId&_filter=`
    })

    const modifiedList = response?.list?.map(record => {
      return {
        recordId: record?.parent?.recordId || null,
        reference: record?.parent?.reference || null,
        name: record?.parent?.fullName || null,
        departmentName: record?.department?.name || null,
        positionName: record?.position?.name || null,
        branchName: record?.branch?.name || null,
        scName: record?.scName || null,
        scTypeName: record?.scTypeName || null,
        hireDate: record?.parent?.hireDate ? formatDateFromApi(record?.parent?.hireDate) : null
      }
    })

    return { list: modifiedList, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: EmployeeRepository.EmployeeChart.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
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

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: SalaryForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 900,
      height: 500,
      title: labels.folder
    })
  }

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.Folders.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
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
