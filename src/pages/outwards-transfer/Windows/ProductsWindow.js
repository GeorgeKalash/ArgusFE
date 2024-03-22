// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import Checkbox from '@mui/material/Checkbox'
import { useEffect, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductsWindow = ({ _labels, width, height, gridData, maxAccess, form }) => {
  const columns = [
    {
      field: 'productRef',
      headerName: _labels.ProductRef,
      flex: 1
    },
    {
      field: 'productName',
      headerName: _labels.ProductName,
      flex: 1
    },
    {
      field: 'dispersalRef',
      headerName: _labels.DispersalRef,
      flex: 1
    },
    {
      field: 'fees',
      headerName: _labels.Fees,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: _labels.BaseAmount,
      flex: 1
    }
  ]

  return (
    <FormShell resourceId={ResourceIds.OutwardsTransfer} form={form} height={480} maxAccess={maxAccess}>
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
