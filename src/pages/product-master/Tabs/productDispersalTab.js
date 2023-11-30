// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Checkbox } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const ProductDispersalTab = ({ dispersalsGridData, getDispersalsGridData, addProductDispersal, delProductDispersal, popupDispersal, maxAccess }) => {
 
  const columns = [
    {
      field: 'reference',
      headerName: 'Reference',
      flex: 1
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'dispersalTypeName',
      headerName: 'Dispersal Type',
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: 'is Inactive',
      flex: 1
    },
    {
      field: 'isDefault',
      headerName: 'is Default',
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
        <GridToolbar onAdd={addProductDispersal} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={dispersalsGridData}
          rowId={['recordId']}
          api={getDispersalsGridData}
          onEdit={popupDispersal}
          onDelete={delProductDispersal}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={200}
        />
      </Box>
    </>
  )
}

export default ProductDispersalTab
