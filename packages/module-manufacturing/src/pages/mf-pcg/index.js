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
import ProductionClassGroupsForm from './Forms/ProductionClassGroupsForm'

const ProductionClassGroupsList = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const response = await getRequest({
      extension: ManufacturingRepository.ProductionClassGroups.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })
    return { ...response, _startAt }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: ManufacturingRepository.ProductionClassGroups.snapshot,
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
    endpointId: ManufacturingRepository.ProductionClassGroups.page,
    datasetId: ResourceIds.ProductionClassGroups,
    search: {
      endpointId: ManufacturingRepository.ProductionClassGroups.snapshot,
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
      extension: ManufacturingRepository.ProductionClassGroups.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: ProductionClassGroupsForm,
      props: { labels, recordId: recordId || null, maxAccess, invalidate },
      width: 500,
      height: 300,
      title: labels.ProductionClassGroup
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

export default ProductionClassGroupsList