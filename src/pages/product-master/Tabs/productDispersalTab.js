// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Checkbox } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const ProductDispersalTab = ({ productDispersalGridData, maxAccess }) => {
  // const columns = [
  //   {
  //     recordId: '1',
  //     field: 'reference',
  //     headerName: 'Reference',
  //     flex: 1
  //   },
  //   {
  //     recordId: '2',
  //     field: 'name',
  //     headerName: 'Name',
  //     flex: 1
  //   },
  //   {
  //     recordId: '3',
  //     field: 'type',
  //     headerName: 'Dispersal Type',
  //     flex: 1
  //   },
  //   {
  //     recordId: '5',
  //     field: 'isDefault',
  //     headerName: 'is Default',
  //     flex: 1,
  //     renderCell: params => (
  //       <Checkbox
  //         color='primary'
  //         checked={params.row.isDefault === true} // Checked based on 'isDefault' property
  //         onChange={() => {
  //           params.row.isDefault = !params.row.isDefault
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     recordId: '6',
  //     field: 'isInactive',
  //     headerName: 'Inactive',
  //     flex: 1,
  //     renderCell: params => (
  //       <Checkbox
  //         color='primary'
  //         checked={params.row.isInactive === true} // Checked based on 'isInactive' property
  //         onChange={() => {
  //           params.row.isInactive = !params.row.isInactive
  //         }}
  //       />
  //     )
  //   }
  // ]
  const dispersalTypeStore = [
    { key: 1, value: 'bank' },
    { key: 2, value: 'cash' },
    { key: 3, value: 'wallet' },
    { key: 4, value: 'delivery' },
  ]
  const columns = [
    { key: 0, header: 'Reference', name: 'reference', value: '' },
    { key: 0, header: 'Name', name: 'dispersalTypeId', value: '' },
    { key: 1, header: 'Disp. Type', name: 'dispersalTypeId',fieldStore:dispersalTypeStore, displayProperties:['value'], value: null },
    { key: 2, header: 'Is Default', name: 'isDefault ', value: false },
    { key: 2, header: 'Is Inactive', name: 'isInactive', value: false },
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
        <Grid container gap={2}>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomTextField label='Reference' value={''} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField label='Name' value={''} readOnly={true} />
            </Grid>
          </Grid>
          <Grid xs={12}>
            {/* <Table
              columns={columns}
              gridData={productDispersalGridData}
              rowId={['recordId']}
              isLoading={false}
              pagination={false}
              height={260}
              maxAccess={maxAccess}
            /> */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', }}>
              <InlineEditGrid columns={columns}/>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default ProductDispersalTab
