// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, Checkbox, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewCurrency, populateCurrency } from 'src/Models/System/currency'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const Currencies = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [decimalStore, setDecimalStore] = useState([])
  const [profileStore, setProfileStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])

  //states
  const [labels, setLabels] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    foreignLanguage: labels && labels.find(item => item.key === 3).value,
    decimals: labels && labels.find(item => item.key === 4).value,
    profile: labels && labels.find(item => item.key === 5).value,
    currencyType: labels && labels.find(item => item.key === 6).value,
    sales: labels && labels.find(item => item.key === 7).value,
    purchase: labels && labels.find(item => item.key === 8).value,
    currency: labels && labels.find(item => item.key === 9).value
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    ,
    {
      field: 'flName',
      headerName: _labels.foreignLanguage,
      flex: 1
    },
    {
      field: 'currencyTypeName',
      headerName: _labels.currencyType,
      flex: 1
    }
  ]

  const currencyValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      decimals: yup.string().required('This field is required'),
      profileId: yup.string().required('This field is required'),
      currencyTypeName: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCurrency(values)
    }
  })

  const handleSubmit = () => {
    currencyValidation.handleSubmit()
  }
  const getLabels = () => {
    var parameters = '_dataset=' + ResourceIds.Currencies

    getRequest({
      extension: KVSRepository.getLabels,
      parameters: parameters
    })
      .then(res => {
        console.log({ res })
        setLabels(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  const getGridData = () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillProfileStore = () => {
    var parameters = '_database=6' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setProfileStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCurrencyStore = () => {
    var parameters = '_database=117' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillDecimalStore = () => {}

  const postCurrency = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.Currency.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delCurrency = obj => {
    postRequest({
      extension: SystemRepository.Currency.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCurrency = () => {
    currencyValidation.setValues(getNewCurrency())
    fillDecimalStore()
    fillProfileStore()
    fillCurrencyStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editCurrency = obj => {
    currencyValidation.setValues(populateCurrency(obj))
    fillDecimalStore()
    fillProfileStore()
    fillCurrencyStore()
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData()
    fillDecimalStore()
    fillProfileStore()
    fillCurrencyStore()
    getLabels()
    const decimalDataSource = [{ decimals: 0 }, { decimals: 1 }, { decimals: 2 }, { decimals: 3 }]
    setDecimalStore(decimalDataSource)
  }, [])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addCurrency} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editCurrency}
          onDelete={delCurrency}
          isLoading={false}
          pageSize={50}
          paginationType='client'
        />
      </Box>
      {windowOpen && (
        <Window
          id='CurrencyWindow'
          Title={_labels.currency}
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
                  label={_labels.reference}
                  value={currencyValidation.values.reference}
                  required
                  onChange={currencyValidation.handleChange}
                  inputProps={{ maxLength: '3' }}
                  onClear={() => currencyValidation.setFieldValue('reference', '')}
                  error={currencyValidation.touched.reference && Boolean(currencyValidation.errors.reference)}
                  helperText={currencyValidation.touched.reference && currencyValidation.errors.reference}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label={_labels.name}
                  value={currencyValidation.values.name}
                  required
                  onChange={currencyValidation.handleChange}
                  onClear={() => currencyValidation.setFieldValue('name', '')}
                  error={currencyValidation.touched.name && Boolean(currencyValidation.errors.name)}
                  helperText={currencyValidation.touched.name && currencyValidation.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='flName'
                  label={_labels.foreignLanguage}
                  value={currencyValidation.values.flName}
                  required
                  onChange={currencyValidation.handleChange}
                  onClear={() => currencyValidation.setFieldValue('flName', '')}
                  error={currencyValidation.touched.flName && Boolean(currencyValidation.errors.flName)}
                  helperText={currencyValidation.touched.flName && currencyValidation.errors.flName}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='decimals'
                  label={_labels.decimals}
                  valueField='decimals'
                  displayField='decimals'
                  store={decimalStore}
                  value={currencyValidation.values.decimals}
                  required
                  onChange={(event, newValue) => {
                    currencyValidation.setFieldValue('decimals', newValue?.decimals)
                  }}
                  error={currencyValidation.touched.decimals && Boolean(currencyValidation.errors.decimals)}
                  helperText={currencyValidation.touched.decimals && currencyValidation.errors.decimals}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='profileId'
                  label={_labels.profile}
                  valueField='key'
                  displayField='value'
                  store={profileStore}
                  value={profileStore.filter(item => item.key === currencyValidation.values.profileId)[0]}
                  required
                  onChange={(event, newValue) => {
                    currencyValidation.setFieldValue('profileId', newValue?.key)
                  }}
                  error={currencyValidation.touched.profileId && Boolean(currencyValidation.errors.profileId)}
                  helperText={currencyValidation.touched.profileId && currencyValidation.errors.profileId}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='currencyType'
                  label={_labels.currencyType}
                  valueField='key'
                  displayField='value'
                  store={currencyStore}
                  value={profileStore.filter(item => item.key === currencyValidation.values.currencyType)[0]}
                  required
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    currencyValidation.setFieldValue('currencyType', newValue?.key)
                    currencyValidation.setFieldValue('currencyTypeName', newValue?.value)
                  }}
                  error={
                    currencyValidation.touched.currencyTypeName && Boolean(currencyValidation.errors.currencyTypeName)
                  }
                  helperText={currencyValidation.touched.currencyTypeName && currencyValidation.errors.currencyTypeName}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='sale'
                      checked={currencyValidation.values?.sale}
                      onChange={currencyValidation.handleChange}
                    />
                  }
                  label={_labels.sales}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='purchase'
                      checked={currencyValidation.values?.purchase}
                      onChange={currencyValidation.handleChange}
                    />
                  }
                  label={_labels.purchase}
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

export default Currencies
