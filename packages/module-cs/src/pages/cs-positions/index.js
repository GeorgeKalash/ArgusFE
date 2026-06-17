import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import PositionsForm from './Forms/PositionsForm'

const Positions = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: companyStructureRepository.CompanyPositions.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_size=40&_sortBy=positionRef`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: companyStructureRepository.CompanyPositions.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const {
    query: { data },
    search,
    clear,
    labels,
    paginationParameters,
    refetch,
    invalidate,
    access: maxAccess
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: companyStructureRepository.CompanyPositions.page,
    datasetId: ResourceIds.CompanyPositions,
    search: {
      searchFn: fetchWithSearch
    }
  })

  const columns = [
    {
      field: 'positionRef',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 2
    },
    {
      field: 'description',
      headerName: labels.description,
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
      extension: companyStructureRepository.CompanyPositions.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    
    invalidate()
  }

  function openForm(recordId) {
    stack({
      Component: PositionsForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 500,
      height: 430,
      title: labels.Positions
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

export default Positions