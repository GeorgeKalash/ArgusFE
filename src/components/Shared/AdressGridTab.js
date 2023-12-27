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
  _labels
}) => {
  const columns = [
    {
      field: 'name',
      headerName: _labels.addressName,
      flex: 1
    },
    {
      field: 'street1',
      headerName: _labels.street1,
      flex: 1
    },
    {
      field: 'street2',
      headerName: _labels.street2,
      flex: 1
    },
    {
      field: 'city',
      headerName: _labels.city,
      flex: 1
    },
    {
      field: 'phone',
      headerName: _labels.phone,
      flex: 1
    },
    {
      field: 'email1',
      headerName: _labels.email1,
      flex: 1
    },
    {
      field: 'email2',
      headerName: _labels.email2,
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
          rowId={['codeId']}
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
