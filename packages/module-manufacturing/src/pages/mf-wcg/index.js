import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import WorkCenterGroupsForm from './Forms/WorkCenterGroupsForm'

const WorkCenterGroupsList = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const response = await getRequest({
      extension: ManufacturingRepository.WorkCenterGroups.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })
    return { ...response, _startAt }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: ManufacturingRepository.WorkCenterGroups.snapshot,
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
    endpointId: ManufacturingRepository.WorkCenterGroups.page,
    datasetId: ResourceIds.WorkCenterGroups,
    search: {
      endpointId: ManufacturingRepository.WorkCenterGroups.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const columns = [
    { field: 'reference', headerName: labels.reference, flex: 1 },
    { field: 'name', headerName: labels.name, flex: 2 }
  ]

  const add = () => openForm()
  const edit = obj => openForm(obj?.recordId)

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.WorkCenterGroups.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: WorkCenterGroupsForm,
      props: { labels, recordId, maxAccess, invalidate },
      width: 500,
      height: 300,
      title: labels.workCenterGroup
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
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default WorkCenterGroupsList