import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/providers/windows'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'
import HrRltForm from './forms/HrRltForm'
import { EmployeeRepository } from '@argus/repositories/repositories/EmployeeRepository'

const HrRlt = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: EmployeeRepository.RelationshipTypes.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.RelationshipTypes.page,
    datasetId: ResourceIds.RelationshipTypes
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
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
      Component: HrRltForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 250,
      title: labels.relationshipType
    })
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.RelationshipTypes.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          columns={columns}
          gridData={data}
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

export default HrRlt
