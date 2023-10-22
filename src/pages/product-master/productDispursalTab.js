// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const ProductDispursalTab = ({ productDispursalGridData }) => {
  const columns = [
    {
      recordId: '1',
      field: 'reference',
      headerName: 'Reference',
      flex: 1
    },
    {
      recordId: '2',
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      recordId: '3',
      field: 'type',
      headerName: 'Dispursal Type',
      flex: 1
    },
    {
      recordId: '4',
      field: 'apiBankCode',
      headerName: 'API Bank Code',
      flex: 1
    },
    {
      recordId: '5',
      field: 'default',
      headerName: 'Default',
      flex: 1
    },
    {
      recordId: '6',
      field: 'isInactive',
      headerName: 'Inactive',
      flex: 1,
      renderCell: params => (
        <Checkbox
          color='primary'
          checked={params.row.isInactive === true} // Checked based on 'isInactive' property
          onChange={() => {
            params.row.isInactive = !params.row.isInactive
          }}
        />
      )
    }
  ]

  const postProductMaster = obj => {}

  const tabs = [{ label: 'Product Master' }, { label: 'Product Dispursal' }, { label: 'Product Leg' }]

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container>
          {/* First Column */}

          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Name' value={'name 1'} readOnly={true} />
            </Grid>
          </Grid>
        </Grid>
        <Table
          columns={columns}
          gridData={productDispursalGridData}
          rowId={['recordId']}
          isLoading={false}
          pagination={false}
        />
      </Box>
    </>
  )
}

export default ProductDispursalTab
