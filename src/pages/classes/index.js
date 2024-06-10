import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ClassesWindow from './Windows/ClassesWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const Classes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    refetch,
    access,
    search,
    clear
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.Class.qry,
    datasetId: ResourceIds.Classes,
    search: {
      endpointId: DocumentReleaseRepository.Class.snapshot,
      searchFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: DocumentReleaseRepository.Class.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: DocumentReleaseRepository.Class.qry,
      parameters: parameters
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  const delClasses = obj => {
    postRequest({
      extension: DocumentReleaseRepository.Class.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success('Record Deleted Successfully')
      invalidate()
    })
  }

  const addClasses = () => {
    openForm('')
  }

  function openForm(recordId) {
    stack({
      Component: ClassesWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 600,
      title: _labels.class
    })
  }

  const popup = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={addClasses}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={popup}
          onDelete={delClasses}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Classes
