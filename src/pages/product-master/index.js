// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// **Tabs
import ProductMasterTab from './productMasterTab'
import ProductDispursalTab from './productDispursalTab'
import ProductLegTab from './productLegTab'
import ProductFieldTab from './productFieldTab'
import ProductAgentTab from './productAgentTab'

const ProductMaster = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])
  const [typeStore, setTypeStore] = useState([])
  const [languageStore, setLanguageStore] = useState([])
  const [commissionBaseStore, setCommissionBaseStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
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
    {
      field: 'type',
      headerName: 'Type',
      flex: 1
    },
    {
      field: 'correspondant',
      headerName: 'Correspondant',
      flex: 1
    },
    {
      field: 'country',
      headerName: 'Country',
      flex: 1
    },
    {
      field: 'currency',
      headerName: 'Currency',
      flex: 1
    },
    {
      field: 'language',
      headerName: 'Language',
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

  const getGridData = () => {}

  const fillTypeStore = () => {
    var parameters = '_database=15' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setTypeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillLanguageStore = () => {
    var parameters = '_database=13' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setLanguageStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillCommissionBaseStore = () => {
    var parameters = '_database=13' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setCommissionBaseStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const postProductMaster = obj => {}

  const tabs = [{ label: 'Main' }, { label: 'Dispursal' }, { label: 'Leg' }, { label: 'Fields' }, { label: 'Agent' }]

  const delProductMaster = obj => {}

  const addProductMaster = () => {
    productMasterValidation.setValues({})
    fillTypeStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    setWindowOpen(true)
  }

  const editProductMaster = obj => {
    productMasterValidation.setValues({})
    fillTypeStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 30 })
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
        <GridToolbar onAdd={addProductMaster} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editProductMaster}
          onDelete={delProductMaster}
          isLoading={false}
        />
      </Box>
      {windowOpen && (
        <Window
          id='ProductMasterWindow'
          Title='Product Master'
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={900}
          height={350}
          onSave={handleSubmit}
        >
          <CustomTabPanel index={0} value={activeTab}>
            <ProductMasterTab
              productMasterValidation={productMasterValidation}
              typeStore={typeStore}
              commissionBaseStore={commissionBaseStore}
              languageStore={languageStore}
            />
          </CustomTabPanel>
          <CustomTabPanel index={1} value={activeTab}>
            <ProductDispursalTab />
          </CustomTabPanel>
          <CustomTabPanel index={2} value={activeTab}>
            <ProductLegTab />
          </CustomTabPanel>
          <CustomTabPanel index={3} value={activeTab}>
            <ProductFieldTab />
          </CustomTabPanel>
          <CustomTabPanel index={4} value={activeTab}>
            <ProductAgentTab />
          </CustomTabPanel>
        </Window>
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ProductMaster
