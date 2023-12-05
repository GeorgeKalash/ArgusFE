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
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import OutwardsWindow from './Windows/OutwardsWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { getNewOutwards, populateOutwards } from 'src/Models/RemittanceActivities/Outwards'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const OutwardsTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [countryStore, setCountryStore] = useState(null)
  const [dispersalTypeStore, setDispersalTypeStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    foreignLanguage: labels && labels.find(item => item.key === 3).value,
  }

  const columns = [
    {
      field: 'countryRef',
      headerName: 'countryRef',
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: 'dispersalName',
      flex: 1
    },
    ,
    {
      field: 'currencyRef',
      headerName: 'currencyRef',
      flex: 1
    },
    {
      field: 'agent',
      headerName: 'agent',
      flex: 1
    }
  ]

  const outwardsValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      dispersaType: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      agentId: yup.string().required('This field is required'),
      
    }),
    onSubmit: values => {
     
    }
  })

  const handleSubmit = () => {
    outwardsValidation.handleSubmit()
  }

  const getGridData = () => {
    // var parameters = '_filter='
    // getRequest({
    //   extension: SystemRepository.Currency.qry,
    //   parameters: parameters
    // })
    //   .then(res => {
    //     setGridData(res)
    //   })
    //   .catch(error => {
    //     setErrorMessage(error)
    //   })
  }


  const fillCountryStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: RemittanceOutwardsRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const onCountrySelection = (countryId) => { 
    //get dispersals list
    var parameters = `_countryId=${countryId}` 
    getRequest({
      extension: RemittanceOutwardsRepository.DispersalType.qry,
      parameters: parameters
    })
      .then(res => {
        setDispersalTypeStore(res)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const onDispersalSelection = (countryId, dispersalType) => {
    //get currencies list
    var parameters = `_countryId=${countryId}&_dispersalType=${dispersalType}` 
    getRequest({
      extension: RemittanceOutwardsRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delOutwards = obj => {
    
  }

  const addOutwards = () => {
    outwardsValidation.setValues(getNewOutwards())
    fillCountryStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editOutwards = obj => {
     outwardsValidation.setValues(populateOutwards(obj))

    // fillCountryStore()
    // setEditMode(true)
    // setWindowOpen(true)
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Currencies, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        fillCountryStore()

        //getLabels(ResourceIds.Currencies, setLabels)
        
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addOutwards} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editOutwards}
          onDelete={delOutwards}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <OutwardsWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          editMode={editMode}
          outwardsValidation={outwardsValidation}
          countryStore={countryStore}
          onCountrySelection={onCountrySelection}
          dispersalTypeStore={dispersalTypeStore}
          onDispersalSelection={onDispersalSelection}
          currencyStore={currencyStore}
          labels={_labels}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default OutwardsTransfer
