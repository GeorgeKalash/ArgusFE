import { Box } from '@mui/material'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

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
      <Grow>
        <GridToolbar onAdd={addUsers} maxAccess={maxAccess} />
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
