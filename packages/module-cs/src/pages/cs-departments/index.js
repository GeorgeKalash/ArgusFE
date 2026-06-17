import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import DepartmentsForm from './Forms/DepartmentsForm'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'

const Departments = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: companyStructureRepository.Departments.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_size=30&_type=0&_activeStatus=0&_sortBy=recordId`
    })

    return {
      ...response,
      _startAt
    }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: companyStructureRepository.Departments.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate,
    search,
    clear
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: companyStructureRepository.Departments.page,
    datasetId: ResourceIds.Departments,
    search: {
      endpointId: companyStructureRepository.Departments.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const columns = [
    {
      field: 'departmentRef',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'managerName',
      headerName: labels.departmentManager,
      flex: 1
    },
    {
      field: 'parentName',
      headerName: labels.parent,
      flex: 1
    },
    {
      field: 'caName',
      headerName: labels.workingCalendar,
      flex: 1
    },
    {
      field: 'scName',
      headerName: labels.attendanceSchedule,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: labels.isInactive,
      type: 'checkbox',
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: companyStructureRepository.Departments.del,
      record: JSON.stringify(obj)
    })

    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: DepartmentsForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 700,
      height: 600,
      title: labels.Departments
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={maxAccess}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
          previewReport={ResourceIds.Departments}
        />
      </Fixed>

      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          maxAccess={maxAccess}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default Departments