import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import { Grow } from './Layouts/Grow'

const AddressGridTab = ({
  addressGridData,
  getAddressGridData,
  addAddress,
  delAddress,
  editAddress,
  maxAccess,
  columns
}) => {
  const { labels: labels, access } = useResourceParams({
    datasetId: ResourceIds.Address
  })

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
        <GridToolbar onAdd={addAddress} maxAccess={maxAccess} />
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
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default AddressGridTab
