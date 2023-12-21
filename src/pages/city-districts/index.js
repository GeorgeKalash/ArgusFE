// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewCityDistrict, populateCityDistrict } from 'src/Models/System/CityDistrict'

// ** Helpers
import {getFormattedNumberMax, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CityDistrictWindow from './Windows/CityDistrictWindow'

const CityDistricts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [cityStore, setCityStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false) 
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    country: labels && labels.find(item => item.key === 3).value,
    cityDistrict: labels && labels.find(item => item.key === 4).value,
    city: labels && labels.find(item => item.key === 5).value
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
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'cityName',
      headerName: _labels.city,
      flex: 1
    }
  ]

  const cityDistrictValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      cityId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values)
      postCityDistrict(values)
    }
  })

  const handleSubmit = () => {
    cityDistrictValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.CityDistrict.page,
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

  const postCityDistrict = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.CityDistrict.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delCityDistrict = obj => {
    postRequest({
      extension: SystemRepository.CityDistrict.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCityDistrict = () => {
    cityDistrictValidation.setValues(getNewCityDistrict)
    fillCountryStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editCityDistrict = obj => {
    console.log(obj)
    cityDistrictValidation.setValues(populateCityDistrict(obj))
    fillCountryStore()
    
    //lookupCity(obj.city)
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.CityDistrict, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        fillCountryStore()
        getLabels(ResourceIds.CityDistrict,setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const fillCountryStore = () => { //check params
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const lookupCity = searchQry => {
    setCityStore([])
    console.log('city')
    console.log(searchQry)
    console.log(cityDistrictValidation.values.countryId)
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${cityDistrictValidation.values.countryId}&_stateId=0`
    
    getRequest({
      extension: SystemRepository.City.snapshot,
      parameters: parameters
    })
      .then(res => {
        console.log(res.list)
        setCityStore(res.list)
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
        <GridToolbar onAdd={addCityDistrict} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editCityDistrict}
          onDelete={delCityDistrict}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
       <CityDistrictWindow
       onClose={() => setWindowOpen(false)}
       width={600}
       height={400}
       onSave={handleSubmit}
       cityDistrictValidation={cityDistrictValidation}
       countryStore={countryStore}
       cityStore={cityStore}
       setCityStore={setCityStore}
       lookupCity={lookupCity}
       _labels ={_labels}
       maxAccess={access}
       editMode={editMode}
       />
       )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default CityDistricts
