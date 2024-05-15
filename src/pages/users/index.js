import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import UsersWindow from './Windows/UsersWindow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const Users = () => {
  const { getRequest, postRequest, getIdentityRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  const [gridData, setGridData] = useState([])

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

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_size=${_pageSize}&_filter=&_sortBy=fullName`
    var parameters = defaultParams

    getRequest({
      extension: SystemRepository.Users.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
        console.log('res response ', res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delUsers = async obj => {
    await postRequest({
      extension: SystemRepository.Users.del,
      record: JSON.stringify(obj)
    })
    toast.success('Record Deleted Successfully')
  }

  const addUsers = () => {}

  const editUsers = async obj => {}

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addUsers} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editUsers}
          onDelete={delUsers}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
        />
      </Grow>

      <UsersWindow labels={_labels} maxAccess={access} />
    </VertLayout>
  )
}

export default Users
