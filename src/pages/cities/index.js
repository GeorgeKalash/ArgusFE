// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, FormControlLabel } from '@mui/material'

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
import { getNewCity, populateCity } from 'src/Models/System/City'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { ContactSupportOutlined } from '@mui/icons-material'

const City = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])
  const [stateStore, setStateStore] = useState([])
  const [countryStore, setCountryStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

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
    ,
    {
      field: 'countryName',
      headerName: 'Country',
      flex: 1
    },
    {
      field: 'stateName',
      headerName: 'State',
      flex: 1
    }
  ]
  const cityValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      stateId: yup.string().required('This field is required')
      //yup.string().nullable()
    }),
    onSubmit: values => {
      postCity(values)
    }
  })

  const handleSubmit = () => {
    cityValidation.handleSubmit()
  }
  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    var parameters = defaultParams + '&_countryId=0' + '&_stateId=0'
    getRequest({
      extension: SystemRepository.City.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  const fillCountryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  const fillStateStore = countryId => {
    var parameters = `_countryId=${countryId}`
    getRequest({
      extension: SystemRepository.State.qry,
      parameters: parameters
    })
      .then(res => {
        setStateStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  const postCity = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.City.set,
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

  const delCity = obj => {
    postRequest({
      extension: SystemRepository.City.del,
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

  const addCity = () => {
    cityValidation.setValues(getNewCity())
    fillCountryStore()
    setStateStore([])
    setEditMode(false)
    setWindowOpen(true)
  }

  const editCity = obj => {
    cityValidation.setValues(populateCity(obj))
    fillCountryStore()
    fillStateStore(obj['countryId'])
    //const comboBox = document.getElementById('stateCombo')
    //console.log(comboBox)
    //comboBox.readOnly = obj['countryId'] === null ? false : true
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 30 })
    fillCountryStore()
  }, [])
  return (
    <>
      <Box>
        <GridToolbar onAdd={addCity} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editCity}
          onDelete={delCity}
          isLoading={false}
          pageSize={50}
        />
      </Box>
      {windowOpen && (
        <Window
          id='CityWindow'
          Title='City'
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
                  value={cityValidation.values.reference}
                  required
                  readOnly={editMode}
                  onChange={cityValidation.handleChange}
                  onClear={() => cityValidation.setFieldValue('reference', '')}
                  error={cityValidation.touched.reference && Boolean(cityValidation.errors.reference)}
                  helperText={cityValidation.touched.reference && cityValidation.errors.reference}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label='Name'
                  value={cityValidation.values.name}
                  required
                  readOnly={editMode}
                  onChange={cityValidation.handleChange}
                  onClear={() => cityValidation.setFieldValue('name', '')}
                  error={cityValidation.touched.name && Boolean(cityValidation.errors.name)}
                  helperText={cityValidation.touched.name && cityValidation.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='countryId'
                  label='Country'
                  valueField='recordId'
                  displayField='name'
                  store={countryStore}
                  value={countryStore.filter(item => item.recordId === cityValidation.values.countryId)[0]}
                  required
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    cityValidation.setFieldValue('countryId', newValue?.recordId)
                    cityValidation.setFieldValue('countryName', newValue?.name)
                    const selectedCountryId = newValue?.recordId || ''
                    fillStateStore(selectedCountryId) // Fetch and update state data based on the selected country
                  }}
                  error={cityValidation.touched.countryId && Boolean(cityValidation.errors.countryId)}
                  helperText={cityValidation.touched.countryId && cityValidation.errors.countryId}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  //id='stateCombo'
                  name='stateId'
                  label='State'
                  valueField='recordId'
                  displayField='name'
                  store={stateStore}
                  value={stateStore.filter(item => item.recordId === cityValidation.values.stateId)[0]}
                  required
                  onChange={(event, newValue) => {
                    cityValidation.setFieldValue('stateId', newValue?.recordId)
                  }}
                  error={cityValidation.touched.stateId && Boolean(cityValidation.errors.stateId)}
                  helperText={cityValidation.touched.stateId && cityValidation.errors.stateId}
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

export default City
