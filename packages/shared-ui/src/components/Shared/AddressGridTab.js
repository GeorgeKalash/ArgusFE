import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const AddressGridTab = ({
  addressGridData,
  addAddress,
  delAddress,
  editAddress,
  paginationParameters,
  refetch,
  datasetId
}) => {
  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.Address,
    DatasetIdAccess: datasetId,
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
          columns={tableColumns}
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
