
// ** MUI Imports
import {Box} from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const UsersTab = ({  
    usersValidation,
    usersGridData,
    getUsersGridData,
    delUsers,
    addUsers,
    labels,
    maxAccess }) => {

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
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
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
          height={300}
        />
      </Box>
    </>
  )
}

export default UsersTab
