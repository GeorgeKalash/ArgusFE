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
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewCountry, populateCountry } from 'src/Models/System/Country'
import { KVSRepository } from 'src/repositories/KVSRepository'

// ** Helpers
import { validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CountryWindow from './Windows/CountryWindow'

const Countries = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [labels, setLabels] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false) 
  const [errorMessage, setErrorMessage] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [currencyStore, setCurrencyStore] = useState([])
  const [regionStore, setRegionStore] = useState([])

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    flName: labels && labels.find(item => item.key === 3).value,
    currencyName: labels && labels.find(item => item.key === 4).value,
    regionName: labels && labels.find(item => item.key === 5).value,
    ibanLength: labels && labels.find(item => item.key === 6).value,
    country: labels && labels.find(item => item.key === 7).value
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
      align: 'right'

      //valueGetter: ({ row }) => getFormattedNumber(row?.ibanLength, 4)
    }
  ]

  const tabs = []

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
    if (activeTab === 0) countryValidation.handleSubmit()
  }

  const getLabels = () => {
    var parameters = '_dataset=' + ResourceIds.Countries

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
    fillCurrencyStore()
    fillRegionStore({})
    setEditMode(false)
    setWindowOpen(true)
  }

  const editCountry = obj => {
    console.log(obj)
    countryValidation.setValues(populateCountry(obj))
    fillCurrencyStore()
    fillRegionStore({})
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData()
    fillCurrencyStore()
    fillRegionStore({})
    getLabels()
  }, [])

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
       <CountryWindow
       onClose={() => setWindowOpen(false)}
       width={600}
       height={400}
       onSave={handleSubmit}
       countryValidation={countryValidation}
       currencyStore={currencyStore}
       regionStore={regionStore}
       _labels ={_labels}
       tabs={tabs}
       activeTab={activeTab}
       setActiveTab={setActiveTab}
       />
       )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Countries
