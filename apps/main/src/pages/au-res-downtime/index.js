import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ResourceDowntimeForm from './forms/ResourceDowntimeForm'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const ResourceDowntime = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: AccessControlRepository.ResourceDowntime.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: AccessControlRepository.ResourceDowntime.page,
    datasetId: ResourceIds.ResourceDowntime
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'typeName',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'moduleName',
      headerName: labels.module,
      flex: 1
    },
    {
      field: 'resourceName',
      headerName: labels.resource,
      flex: 1
    },
    {
      field: 'sgName',
      headerName: labels.SecurityGroup,
      flex: 1
    },
    {
      field: 'timeFrom',
      headerName: labels.timeFrom,
      flex: 1,
      type: 'time'
    },
    {
      field: 'timeTo',
      headerName: labels.timeTo,
      flex: 1,
      type: 'time'
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
      extension: AccessControlRepository.ResourceDowntime.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: ResourceDowntimeForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 700,
      height: 550,
      title: labels.resourceDowntime
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
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
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default ResourceDowntime
