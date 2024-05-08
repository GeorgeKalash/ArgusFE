import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const UsersTab = ({ usersValidation, usersGridData, getUsersGridData, delUsers, addUsers, labels, maxAccess }) => {
  const columns = [
    {
      field: 'fullName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'email',
      headerName: labels.email,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addUsers} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={usersGridData}
          rowId={['userId']}
          api={getUsersGridData}
          onDelete={delUsers}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default UsersTab
