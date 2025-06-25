import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import { Grow } from './Layouts/Grow'

const AddressGridTab = ({
  addressGridData,
  getAddressGridData,
  addAddress,
  delAddress,
  editAddress,
  labels,
  maxAccess,
  columns
}) => {
  const tableColumns = [
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
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addAddress} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns || tableColumns}
          gridData={addressGridData}
          rowId={['recordId']}
          api={getAddressGridData}
          onEdit={editAddress}
          onDelete={delAddress}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default AddressGridTab
