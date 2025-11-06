import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
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
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const Users = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: SystemRepository.Users.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: SystemRepository.Users.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({
        _startAt: pagination._startAt || 0,
        params: filters?.params
      })
    }
  }

  const {
    query: { data },
    labels,
    refetch,
    filterBy,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Users.page,
    datasetId: ResourceIds.Users,
    filter: { filterFn: fetchWithFilter }
  })

  function openForm(recordId) {
    stack({
      Component: UsersWindow,
      props: {
        labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 900,
      height: 650,
      title: labels.users
    })
  }

  const columns = [
    {
      field: 'fullName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'username',
      headerName: labels.username,
      flex: 1
    },
    {
      field: 'email',
      headerName: labels.email,
      flex: 1
    },
    {
      field: 'userTypeName',
      headerName: labels.username,
      flex: 1
    },
    {
      field: 'languageName',
      headerName: labels.language,
      flex: 1
    },
    {
      field: 'activeStatusName',
      headerName: labels.activeStatus,
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
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'SYUS'} filterBy={filterBy} />
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
