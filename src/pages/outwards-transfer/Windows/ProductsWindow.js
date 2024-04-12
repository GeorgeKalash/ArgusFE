// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import Checkbox from '@mui/material/Checkbox'
import { useEffect, useState } from 'react'
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
      height={480}
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
