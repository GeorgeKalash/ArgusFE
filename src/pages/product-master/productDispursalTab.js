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
      field: 'type',
      headerName: 'Dispursal Type',
      flex: 1
    },
    {
      field: 'apiBankCode',
      headerName: 'API Bank Code',
      flex: 1
    },
    {
      field: 'default',
      headerName: 'Default',
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: 'Inactive',
      flex: 1
    }
  ]

  const productMasterValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      type: yup.string().required('This field is required'),
      correspondant: yup.string().required('This field is required'),
      country: yup.string().required('This field is required'),
      language: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postProductMaster(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) productMasterValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {}

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
