import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import WorkCentersForm from './form/WorkCentersForm'

const WorkCenters = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FoundryRepository.WorkCenter.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    invalidate,
    paginationParameters,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FoundryRepository.WorkCenter.page,
    datasetId: ResourceIds.FoWorkCenters
  })

  const columns = [
    {
      field: 'workCenterName',
      headerName: _labels.workCenter,
      flex: 1
    },
    {
      field: 'activityName',
      headerName: _labels.activity,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: FoundryRepository.WorkCenter.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const edit = obj => {
    openForm(obj?.workCenterId)
  }

  const add = () => {
    openForm()
  }

  function openForm(workCenterId) {
    stack({
      Component: WorkCentersForm,
      props: {
        labels: _labels,
        workCenterId,
        maxAccess: access
      },
      width: 500,
      height: 260,
      title: _labels.workCenter
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['workCenterId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={access}
          refetch={refetch}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default WorkCenters
