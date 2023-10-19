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
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProductFieldTab = () => {
  //stores
  const [gridData, setGridData] = useState([])

  const columns = [
    {
      field: 'controls',
      headerName: 'Controls',
      flex: 1
    },
    {
      field: 'format',
      headerName: 'Format',
      flex: 1
    },
    {
      field: 'securityLevel',
      headerName: 'securityLevel',
      flex: 1
    },
    {
      field: 'specialChars',
      headerName: 'special Chars',
      flex: 1
    },
    {
      field: 'fixedLength',
      headerName: 'fixed Length',
      flex: 1
    },
    {
      field: 'minLength',
      headerName: 'min Length',
      flex: 1
    },
    {
      field: 'maxLength',
      headerName: 'max Length',
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

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const newData = {
      list: [
        {
          recordId: 1,
          controls: 'phone',
          format: 'Alfa',
          securityLevel: 'readOnly',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 2,
          controls: 'email',
          format: 'Alfa+SP',
          securityLevel: 'Optional',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 3,
          controls: 'Country',
          format: 'Numeric',
          securityLevel: 'Mandatory',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 4,
          controls: 'City',
          format: 'Alfa Numeric',
          securityLevel: 'hidden',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        }
      ]
    }
    setGridData({ ...newData })
  }

  const postProductMaster = obj => {}

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
            <Grid item xs={12}>
              <CustomComboBox name='plantName' label='Plant' readOnly={true} required />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='dispursal' label='Dispursal' readOnly={true} required />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid ccontainer rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Name' value={'name 1'} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='currencyName' label='Currency' required />
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

export default ProductFieldTab
