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

const ProductDispursalTab = () => {
  //stores
  const [gridData, setGridData] = useState([])

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

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const newData = {
      list: [
        {
          recordId: 1,
          reference: 'NTFS',
          name: 'NTFS',
          type: 'bank',
          apiBankCode: 'ABC',
          default: 'ABC',
          isInactive: true
        },
        {
          recordId: 2,
          reference: 'CASH',
          name: 'cash',
          type: 'cash',
          apiBankCode: 'ABC',
          default: 'ABC',
          isInactive: false
        },
        {
          recordId: 3,
          reference: 'WALLET',
          name: 'wallet (bitcoin)',
          type: 'wallet',
          apiBankCode: 'ABC',
          default: 'ABC',
          isInactive: false
        },
        {
          recordId: 4,
          reference: 'CASH DLV',
          name: 'cash delivery',
          type: 'delivery',
          apiBankCode: 'ABC',
          default: 'ABC',
          isInactive: true
        }
      ]
    }
    setGridData({ ...newData })
  }

  const postProductMaster = obj => {}

  const tabs = [{ label: 'Product Master' }, { label: 'Product Dispursal' }, { label: 'Product Leg' }]

  useEffect(() => {
    getGridData({})
  }, [])

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
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          pagination={false}
        />
      </Box>
    </>
  )
}

export default ProductDispursalTab
