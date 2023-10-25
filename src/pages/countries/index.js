// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Checkbox, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import GridToolbar from 'src/components/Shared/GridToolbar'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewCountry, populateCountry } from 'src/Models/System/Country'

// ** Helpers
import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'

const Countries = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [currencyStore, setCurrencyStore] = useState([])
  const [regionStore, setRegionStore] = useState([])

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
      field: 'flName',
      headerName: 'Foreign Language Name',
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: 'Currency',
      flex: 1
    },
    {
      field: 'regionName',
      headerName: 'Region',
      flex: 1
    },
    {
      field: 'ibanLength',
      headerName: 'IBAN Length',
      flex: 1,
      align: 'right'

      //valueGetter: ({ row }) => getFormattedNumber(row?.ibanLength, 4)
    }
  ]

  const countryValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      ibanLength: yup
        .number()
        .transform((value, originalValue) => validateNumberField(value, originalValue))
        .min(0, 'Value must be greater than or equal to 0')
        .max(32767, 'Value must be less than or equal to 32,767'),
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      values.ibanLength = getNumberWithoutCommas(values.ibanLength)
      postCountry(values)
    }
  })

  const handleSubmit = () => {
    countryValidation.handleSubmit()
  }

  const getGridData = () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
        console.log(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postCountry = obj => {
    console.log(obj)
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.Country.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData()
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delCountry = obj => {
    postRequest({
      extension: SystemRepository.Country.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData()
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCountry = () => {
    countryValidation.setValues(getNewCountry())
    FillCurrencyStore()
    FillRegionStore({})
    setEditMode(false)
    setWindowOpen(true)
  }

  const editCountry = obj => {
    console.log(obj)
    countryValidation.setValues(populateCountry(obj))
    FillCurrencyStore()
    FillRegionStore({})
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData()
    FillCurrencyStore()
    FillRegionStore({})
  }, [])

  const FillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const FillRegionStore = ({ _startAt = 0, _pageSize = 1000 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.GeographicRegion.qry,
      parameters: parameters
    })
      .then(res => {
        setRegionStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addCountry} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editCountry}
          onDelete={delCountry}
          isLoading={false}
          pageSize={50}
          paginationType='client'
        />
      </Box>
      {windowOpen && (
        <Window
          id='CountryWindow'
          Title='Country'
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
        >
          <CustomTabPanel>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label='Reference'
                  value={countryValidation.values.reference}
                  required
                  onChange={countryValidation.handleChange}
                  onClear={() => countryValidation.setFieldValue('reference', '')}
                  error={countryValidation.touched.reference && Boolean(countryValidation.errors.reference)}
                  helperText={countryValidation.touched.reference && countryValidation.errors.reference}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label='Name'
                  value={countryValidation.values.name}
                  required
                  onChange={countryValidation.handleChange}
                  onClear={() => countryValidation.setFieldValue('name', '')}
                  error={countryValidation.touched.name && Boolean(countryValidation.errors.name)}
                  helperText={countryValidation.touched.name && countryValidation.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='flName'
                  label='Foreign Language Name'
                  value={countryValidation.values.flName}
                  onChange={countryValidation.handleChange}
                  onClear={() => countryValidation.setFieldValue('flName', '')}
                  error={countryValidation.touched.flName && Boolean(countryValidation.errors.flName)}
                  helperText={countryValidation.touched.flName && countryValidation.errors.flName}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='currencyId'
                  label='Currency'
                  valueField='recordId'
                  displayField='name'
                  store={currencyStore}
                  value={countryValidation.values.currencyName}
                  onChange={(event, newValue) => {
                    countryValidation.setFieldValue('currencyId', newValue?.recordId)
                    countryValidation.setFieldValue('currencyName', newValue?.name)
                  }}
                  error={countryValidation.touched.currencyName && Boolean(countryValidation.errors.currencyName)}
                  helperText={countryValidation.touched.currencyName && countryValidation.errors.currencyName}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='regionId'
                  label='Region'
                  valueField='recordId'
                  displayField='name'
                  store={regionStore}
                  value={countryValidation.values.regionName}
                  onChange={(event, newValue) => {
                    countryValidation.setFieldValue('regionId', newValue?.recordId)
                    countryValidation.setFieldValue('regionName', newValue?.name)
                  }}
                  error={countryValidation.touched.regionName && Boolean(countryValidation.errors.regionName)}
                  helperText={countryValidation.touched.regionName && countryValidation.errors.regionName}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='ibanLength'
                  label='IBAN Length'
                  value={countryValidation.values.ibanLength}
                  onChange={e => countryValidation.setFieldValue('ibanLength', getFormattedNumber(e.target.value, 4))}
                  onClear={() => countryValidation.setFieldValue('ibanLength', '')}
                  error={countryValidation.touched.ibanLength && Boolean(countryValidation.errors.ibanLength)}
                  helperText={countryValidation.touched.ibanLength && countryValidation.errors.ibanLength}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='isInactive'
                      checked={countryValidation.values?.isInactive}
                      onChange={countryValidation.handleChange}
                    />
                  }
                  label='Is Inactive'
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
        </Window>
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Countries
