import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import JobInfoForm from './form/jobInfoForm'

const EMJobInfo = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.JobInfo.page,
    datasetId: ResourceIds.JobInfos,

    filter: {
      endpointId: EmployeeRepository.JobInfo.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters, pagination }) {
    return filters.qry
      ? await getRequest({
          extension: EmployeeRepository.JobInfo.snapshot,
          parameters: `_filter=${filters.qry}`
        })
      : await fetchGridData(pagination)
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: EmployeeRepository.JobInfo.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_size=50&_sortBy=`
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
      field: 'employeeName',
      headerName: _labels.employeeName,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'department',
      headerName: _labels.department,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: _labels.branch,
      flex: 1
    },
    {
      field: 'positionName',
      headerName: _labels.position,
      flex: 1
    },
    {
      field: 'reportToName',
      headerName: _labels.reportTo,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: _labels.releaseStatus,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.wip,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: EmployeeRepository.JobInfo.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  function openForm(recordId) {
    stack({
      Component: JobInfoForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: _labels.itemGroup
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar filterBy={filterBy} onAdd={add} maxAccess={access} reportName='EPJI' />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default EMJobInfo
