import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import UsersWindow from './Windows/UsersWindow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'

const Users = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.Users.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_size=${_pageSize}&_filter=&_sortBy=fullName`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    search,
    clear,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Users.qry,
    datasetId: ResourceIds.Users,
    search: {
      endpointId: SystemRepository.Users.snapshot,
      searchFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: SystemRepository.Users.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  function openForm(recordId) {
    stack({
      Component: UsersWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 900,
      height: 600,
      title: _labels.users
    })
  }

  const columns = [
    {
      field: 'fullName',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'username',
      headerName: _labels.username,
      flex: 1
    },
    {
      field: 'email',
      headerName: _labels.email,
      flex: 1
    },
    {
      field: 'userTypeName',
      headerName: _labels.username,
      flex: 1
    },
    {
      field: 'languageName',
      headerName: _labels.language,
      flex: 1
    },
    {
      field: 'activeStatusName',
      headerName: _labels.activeStatus,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.Users.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} onSearch={search} onSearchClear={clear} inputSearch={true} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default Users
