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
import { getNewCountry, populateCountry } from 'src/Models/System/Country'

// ** Helpers
import {getFormattedNumberMax, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CountryWindow from './Windows/CountryWindow'

const Countries = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [regionStore, setRegionStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false) 
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    flName: labels && labels.find(item => item.key === "3").value,
    currencyName: labels && labels.find(item => item.key === "4").value,
    regionName: labels && labels.find(item => item.key === "5").value,
    ibanLength: labels && labels.find(item => item.key === "6").value,
    country: labels && labels.find(item => item.key === "7").value,
    isInactive: labels && labels.find(item => item.key === "8").value
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
      field: 'flName',
      headerName: _labels.flName,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currencyName,
      flex: 1
    },
    {
      field: 'regionName',
      headerName: _labels.regionName,
      flex: 1
    },
    {
      field: 'ibanLength',
      headerName: _labels.ibanLength,
      flex: 1,
      align: 'right',

      valueGetter: ({ row }) => getFormattedNumberMax(row?.ibanLength, 5, 0)
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
      console.log(values);
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
      extension: SystemRepository.Country.qry, //we can use page
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
    countryValidation.setValues(getNewCountry)
    fillCurrencyStore()
    fillRegionStore({})
    setEditMode(false)
    setWindowOpen(true)
  }

  const editCountry = obj => {
    console.log(obj)
    fillCurrencyStore()
    fillRegionStore({})
    getCountryById(obj)
    setEditMode(true)
    
  }

  
  const getCountryById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Country.get,
      parameters: parameters
    })
      .then(res => {
        res.ibanLength = typeof res.ibanLength !== undefined && getFormattedNumberMax(res?.ibanLength, 5, 0)
        countryValidation.setValues(populateCountry(res.record))

        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  } 

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Countries, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        fillCurrencyStore()
        fillRegionStore({})
        getLabels(ResourceIds.Countries,setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
    }

  const fillRegionStore = ({ _startAt = 0, _pageSize = 1000 }) => {
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
        <GridToolbar onAdd={addCountry} maxAccess={access} />
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
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
       <CountryWindow
       onClose={() => setWindowOpen(false)}
       width={600}
       height={400}
       onSave={handleSubmit}
       countryValidation={countryValidation}
       currencyStore={currencyStore}
       regionStore={regionStore}
       _labels ={_labels}
       maxAccess={access}
       editMode={editMode}
       onInfo={() => setWindowInfo(true)}
       />
       )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Countries
