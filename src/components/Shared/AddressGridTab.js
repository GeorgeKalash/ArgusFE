import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import { Grow } from './Layouts/Grow'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'

const AddressGridTab = ({
  addressGridData,
  addAddress,
  delAddress,
  editAddress,
  columns,
  paginationParameters,
  refetch
}) => {
  const { labels, access: maxAccess } = useResourceParams({
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
          name='address'
          columns={columns || tableColumns}
          gridData={addressGridData}
          rowId={['recordId']}
          onEdit={editAddress}
          onDelete={delAddress}
          isLoading={false}
          maxAccess={maxAccess}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default AddressGridTab
