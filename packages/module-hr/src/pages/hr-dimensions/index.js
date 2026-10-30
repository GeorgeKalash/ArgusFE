import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import HRDimensionsForm from './forms/HRDimensionsForm'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

export default function HrDimensions () {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: EmployeeRepository.EmployeeDimensions.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeeDimensions.page,
    datasetId: ResourceIds.HRDimensions
  })

  const columns = [
    {
      field: 'id',
      headerName: labels.id,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 2
    }
  ]

  const add = () => {openForm()}
  const edit = obj => {openForm(obj?.id)}

  function openForm(id) {
    stack({
      Component: HRDimensionsForm,
      props: {
        labels,
        id,
        maxAccess: access
      },
      width: 500,
      height: 250,
      title: labels.dimensions
    })
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.EmployeeDimensions.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['id']}
          onEdit={edit}
          onDelete={del}
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

