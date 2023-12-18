// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import Checkbox from '@mui/material/Checkbox'
import { useState } from 'react'

const ProductsWindow = ({
    onClose,
    width,
    height,
    onSave,
    gridData,
    setSelectedRow,
    selectedRow,
    maxAccess
}) => {

    const handleCheckboxChange = (id) => {
      setSelectedRow(id);

      // Additional logic if needed
    };

    const columns = [
        {
            field: 'checkbox',
            headerName: 'Select',
            flex: 1,
            renderCell: (params) => (
              <Checkbox
                checked={params.row.productId === selectedRow}
                onChange={() => handleCheckboxChange(params.row.productId)}
                color="primary"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
            ),
        },
        {
          field: 'productRef',
          headerName: 'productRef',
          flex: 1
        },
        {
          field: 'productName',
          headerName: 'productName',
          flex: 1
        },
        {
          field: 'dispersalRef',
          headerName: 'dispersalRef',
          flex: 1
        },
        {
          field: 'fees',
          headerName: 'fees',
          flex: 1
        },
        {
          field: 'baseAmount',
          headerName: 'baseAmount',
          flex: 1
        }
      ]

return (

        <Window
        id='ProductsWindow'
        Title='Products'
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        >
            <CustomTabPanel>
            <Table
                width={width}
                height={height}
                columns={columns}
                gridData={gridData}
                rowId={['productId']}
                isLoading={false}
                pagination={false}
                maxAccess={maxAccess}
                />
            </CustomTabPanel>
        </Window> 
        )
    }
    
    export default ProductsWindow