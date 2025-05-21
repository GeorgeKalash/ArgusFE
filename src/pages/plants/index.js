import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import PlantWindow from './Windows/PlantWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const Plants = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    search,
    clear,
    filterBy,
    refetch,
    labels: _labels,
    paginationParameters,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Plant.page,
    datasetId: ResourceIds.Plants,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    return await getRequest({
      extension: SystemRepository.Plant.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=${params || ''}`
    })
  }
  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
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
      field: 'costCenterName',
      headerName: _labels.costCenter,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.plantGrp,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      type: 'checkbox',
      flex: 1
    }
  ]

  const delPlant = obj => {
    postRequest({
      extension: SystemRepository.Plant.del,
      record: JSON.stringify(obj)
    }).then(res => {
      invalidate()
      toast.success(platformLabels.Deleted)
    })
  }

  const addPlant = () => {
    openForm()
  }

  const editPlant = obj => {
    openForm(obj.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: PlantWindow,
      props: {
        labels: _labels,
        recordId,
        editMode: recordId && true
      },
      width: 800,
      height: 640,
      title: _labels.plant
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          maxAccess={access}
          reportName={'SYPLT'}
          filterBy={filterBy}
          onAdd={addPlant}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
          previewReport={ResourceIds.Plants}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editPlant}
          onDelete={delPlant}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Plants
