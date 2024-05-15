import Table from 'src/components/Shared/Table'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductsWindow = ({ labels, width, height, gridData, maxAccess, form }) => {
  const columns = [
    {
      field: 'productRef',
      headerName: labels.ProductRef,
      flex: 1
    },
    {
      field: 'productName',
      headerName: labels.ProductName,
      flex: 1
    },
    {
      field: 'corName',
      headerName: labels.corName,
      flex: 1
    },
    {
      field: 'interfaceName',
      headerName: labels.interface,
      flex: 1
    },
    {
      field: 'dispersalRef',
      headerName: labels.DispersalRef,
      flex: 1
    },
    {
      field: 'fees',
      headerName: labels.Fees,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: labels.BaseAmount,
      flex: 1
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.OutwardsTransfer}
      form={form}
      maxAccess={maxAccess}
      infoVisible={false}
    >
      <Table
        width={width}
        height={height}
        columns={columns}
        gridData={gridData}
        rowId={['productId']}
        isLoading={false}
        pagination={false}
        maxAccess={maxAccess}
        showCheckboxColumn={true}
        handleCheckedRows={() => {}}
      />
    </FormShell>
  )
}

export default ProductsWindow
