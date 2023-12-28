// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const AdressGridTab = ({
  addressValidation,
  getAddressValidation,
  addAddress,
  delAddress,
  editAddress,
  maxAccess,
  labels
}) => {
  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'street1',
      headerName: labels.street1,
      flex: 1
    },
    {
      field: 'street2',
      headerName: labels.street2,
      flex: 1
    },
    {
      field: 'city',
      headerName: labels.city,
      flex: 1
    },
    {
      field: 'phone',
      headerName: labels.phone,
      flex: 1
    },
    {
      field: 'email1',
      headerName: labels.email1,
      flex: 1
    },
    {
      field: 'email2',
      headerName: labels.email2,
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
        <GridToolbar onAdd={addAddress} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={addressValidation}
          rowId={['recordId']}
          api={getAddressValidation}
          onEdit={editAddress}
          onDelete={delAddress}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default AdressGridTab
