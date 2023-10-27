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
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewCity, populateCity } from 'src/Models/System/City'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { ContactSupportOutlined } from '@mui/icons-material'
import { ResourceIds } from 'src/resources/ResourceIds'
import { KVSRepository } from 'src/repositories/KVSRepository'

// ** Windows
import CityWindow from './Windows/CityWindow'

const City = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])
  const [stateStore, setStateStore] = useState([])
  const [countryStore, setCountryStore] = useState([])

  //states
  const [labels, setLabels] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    country: labels && labels.find(item => item.key === 3).value,
    state: labels && labels.find(item => item.key === 4).value,
    cities: labels && labels.find(item => item.key === 5).value
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
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'stateName',
      headerName: _labels.state,
      flex: 1
    }
  ]

  const cityValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required')

      // stateId: yup.string().nullable()

    }),
    onSubmit: values => {
      postCity(values)
    }
  })

  const handleSubmit = () => {
    cityValidation.handleSubmit()
  }

  const getLabels = () => {
    var parameters = '_dataset=' + ResourceIds.Cities

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

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
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
        getGridData({ })
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

    //console.log('countryId ' + obj['countryId'])
    
    fillStateStore(obj['countryId'])
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 50 })
    fillCountryStore()
    getLabels()
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
        />
      </Box>
      {windowOpen && (
        <CityWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          cityValidation={cityValidation}
          onSave={handleSubmit}
          labels={_labels}
          editMode={editMode}
          stateStore={stateStore}
          countryStore={countryStore}
          fillStateStore={fillStateStore}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default City
