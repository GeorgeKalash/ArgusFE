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
import ProductsWindow from './Windows/ProductsWindow'

const OutwardsTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [plantStore, setPlantStore] = useState(null)
  const [countryStore, setCountryStore] = useState(null)
  const [dispersalTypeStore, setDispersalTypeStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [agentsStore, setAgentsStore] = useState([])
  const [productsStore, setProductsStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [productsWindowOpen, setProductsWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null);

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
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      agentId: yup.string().required('This field is required'),
      amount: yup.string().required('This field is required'),
      productId: yup.string().required('This field is required'),
      fees: yup.string().required('This field is required'),
      baseAmount: yup.string().required('This field is required'),

    }),
    onSubmit: values => {

    }
  })

  const handleSubmit = () => {
    outwardsValidation.handleSubmit()
  }

  const handleProductSelection = () => {
    const selectedRowData = productsStore?.list.find((row) => row.productId === selectedRow);
    console.log(selectedRowData);
    outwardsValidation.setFieldValue('productId', selectedRowData?.productId)
    outwardsValidation.setFieldValue('fees', selectedRowData?.fees)
    outwardsValidation.setFieldValue('baseAmount', selectedRowData?.baseAmount)
    outwardsValidation.setFieldValue('net', selectedRowData?.fees + selectedRowData?.baseAmount)
    setProductsWindowOpen(false);
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

  const fillPlantStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    })
      .then(res => {
        setPlantStore(res)
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

  const onCurrencySelection = (countryId, dispersalType, currencyId) => {
    //get agents list
    var parameters = `_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}`
    getRequest({
      extension: RemittanceOutwardsRepository.Agent.qry,
      parameters: parameters
    })
      .then(res => {
        setAgentsStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //_type=2&_functionId=1&_plantId=1&_countryId=124&_currencyId=90&_dispersalType=2&_amount=200&_agentId=4
  const onAmountDataFill = (formFields) => {

    //get products list
    // type, functionId, plantId, countryId, dispersalType, currencyId, amount, agentId
    var type = 2;
    var functionId = 1;
    var plant = formFields?.plantId;
    var countryId = formFields?.countryId
    var currencyId = formFields?.currencyId
    var dispersalType = formFields?.dispersalType
    var agentId = formFields?.agentId
    var amount = formFields?.amount


     var parameters = `_type=${type}&_functionId=${functionId}&_plantId=${plant}&_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}&_agentId=${agentId}&_amount=${amount}`

    getRequest({
      extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
      parameters: parameters
    })
      .then(res => {
        setProductsStore(res);
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }



  const delOutwards = obj => {

  }

  const addOutwards = () => {
    console.log(getNewOutwards())
    outwardsValidation.setValues(getNewOutwards())
    fillCountryStore()

    //setUserDefaultPlant()
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
        fillPlantStore()
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
          height={350}
          onSave={handleSubmit}
          editMode={editMode}
          outwardsValidation={outwardsValidation}
          plantStore={plantStore}
          countryStore={countryStore}
          onCountrySelection={onCountrySelection}
          dispersalTypeStore={dispersalTypeStore}
          onDispersalSelection={onDispersalSelection}
          currencyStore={currencyStore}
          onCurrencySelection={onCurrencySelection}
          agentsStore={agentsStore}
          productsStore={productsStore}
          onAmountDataFill={onAmountDataFill}
          labels={_labels}
          setProductsWindowOpen={setProductsWindowOpen}
          maxAccess={access}
        />
      )}

      {productsWindowOpen && (
        <ProductsWindow
          onClose={() => setProductsWindowOpen(false)}
          width={700}
          height={200}
          onSave={handleProductSelection}
          gridData={productsStore}
          setSelectedRow={setSelectedRow}
          selectedRow={selectedRow}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default OutwardsTransfer
