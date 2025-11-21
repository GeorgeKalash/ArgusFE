import { useContext } from 'react'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FixedAssetsRepository } from '@argus/repositories/src/repositories/FixedAssetsRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import LocationForm from './forms/LocationForm'
import toast from 'react-hot-toast'

const FaLocations = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const fetchGridData = async (options = {}) => {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FixedAssetsRepository.Location.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    invalidate,
    refetch,
    paginationParameters,
    isLoading
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FixedAssetsRepository.Location.page,
    datasetId: ResourceIds.Location
  })

  const openForm = recordId => {
    stack({
      Component: LocationForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: _labels?.location
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'costCenterName',
      headerName: _labels.costCenter,
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
      extension: FixedAssetsRepository.Location.del,
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
          isLoading={isLoading}
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

export default FaLocations
