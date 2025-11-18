import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { useWindow } from '@argus/shared-providers/providers/windows'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'
import { AccessControlRepository } from '@argus/repositories/repositories/AccessControlRepository'
import NotificationLabelsForm from './Forms/NotificationLabelsForm'

const NotificationLabel = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: AccessControlRepository.NotificationLabel.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    refetch,
    invalidate,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: AccessControlRepository.NotificationLabel.page,
    datasetId: ResourceIds.NotificationLabels
  })

  const columns = [
    {
      field: 'label',
      headerName: labels.label,
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
      Component: NotificationLabelsForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 270,
      title: labels.NotificationLabels
    })
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.NotificationLabel.del,
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

export default NotificationLabel
