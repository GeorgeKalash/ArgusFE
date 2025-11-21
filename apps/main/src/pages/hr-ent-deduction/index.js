import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import EntDeductionForm from './Forms/EntDeductionForm'

const EntDeduction = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: EmployeeRepository.EmployeeDeduction.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: EmployeeRepository.EmployeeDeduction.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const {
    query: { data },
    search,
    clear,
    labels,
    invalidate,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeeDeduction.page,
    datasetId: ResourceIds.EntitlementDeduction,
    search: {
      searchFn: fetchWithSearch
    }
  })

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
      field: 'typeName',
      headerName: labels.type,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: EntDeductionForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 700,
      height: 500,
      title: labels.entitlementDeduction
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.EmployeeDeduction.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
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
          pageSize={50}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default EntDeduction
