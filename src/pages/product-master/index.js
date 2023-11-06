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
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { getNewProductMaster, populateProductMaster } from 'src/Models/RemittanceSettings/ProductMaster'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { getFormattedNumber } from 'src/lib/numberField-helper'

// ** Windows
import ProductMasterWindow from './Windows/ProductMasterWindow'
import ProductLegWindow from './Windows/ProductLegWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductMaster = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAccess } = useContext(ControlContext)

  //controls
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [typeStore, setTypeStore] = useState([])
  const [functionStore, setFunctionStore] = useState([])
  const [languageStore, setLanguageStore] = useState([])
  const [commissionBaseStore, setCommissionBaseStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [plantStore, setPlantStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [dispersalStore, setDispersalStore] = useState([])

  const [productLegGridData, setProductLegGridData] = useState([]) //for productLegTab
  const [productLegCommissionGridData, setProductLegCommissionGridData] = useState([]) //for productLegTab
  const [productFieldGridData, setProductFieldGridData] = useState([]) //for productFieldTab
  const [productAgentGridData, setProductAgentGridData] = useState([]) //for product agent tab
  const [productCountriesGridData, setProductCountriesGridData] = useState([]) //for countries tab
  const [productCurrenciesGridData, setProductCurrenciesGridData] = useState([]) //for monetary tab
  const [productDispersalGridData, setProductDispersalGridData] = useState([]) //for product dispersal tab
  const [productSchedulesGridData, setProductSchedulesGridData] = useState([]) //for product dispersal tab

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  const [labels, setLabels] = useState(null)

  const [productLegWindowOpen, setProductLegWindowOpen] = useState(false) //for productLegTab
  
  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    type: labels && labels.find(item => item.key === 3).value,
    function: labels && labels.find(item => item.key === 4).value,
    correspondant: labels && labels.find(item => item.key === 5).value,
    language: labels && labels.find(item => item.key === 6).value,
    interface: labels && labels.find(item => item.key === 7).value,
    commissionBase: labels && labels.find(item => item.key === 8).value,
    messageToOperator: labels && labels.find(item => item.key === 9).value,
    activateCounterMessage: labels && labels.find(item => item.key === 10).value,
    isInactive: labels && labels.find(item => item.key === 11).value,
    productMaster: labels && labels.find(item => item.key === 12).value
  }

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

  const commissionColumns = [
    {
      field: 'checkBox',
      headerName: '',
      flex: 0.5,
      renderCell: params => (
        <Checkbox
          color='primary'
          checked={params.row.checkBox === true}
          onChange={() => {
            params.row.checkBox = !params.row.checkBox
          }}
        />
      )
    },
    {
      field: 'commissionRef',
      headerName: 'Commission Ref',
      flex: 1,
    },
    {
      field: 'commissionName',
      headerName: 'Commission Name',
      flex: 1,
    },
    {
      field: 'commission',
      headerName: 'Commission',
      flex: 1,
      align: 'right',
      valueGetter: ({ row }) => getFormattedNumber(row?.commission, 2)
    }
  ]

  const productMasterValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      type: yup.string().required('This field is required'),
      function: yup.string().required('This field is required'),
      correspondantId: yup.string().nullable(),
      countryId: yup.string().required('This field is required'),
      language: yup.string().required('This field is required'),
      commissionBase: yup.string().required('This field is required'),
      interfaceId: yup.string().nullable(),
      posMsg: yup.string().nullable(),
      posMsgIsActive: yup.string().nullable(),
      isInactive: yup.string().nullable(),

      //not needed if going to be conditionaly changed according to another field value
      // correspondant: yup.string().required('This field is required'),
    }),
    onSubmit: values => {
      console.log('handle submit in productMasterValidation');
      postProductMaster(values)
    }
  })

  const productLegValidation = useFormik({
  })

  const handleSubmit = () => {
    console.log('handle submit');
    console.log(activeTab);
    if (activeTab === 0) productMasterValidation.handleSubmit()
    
    //else if (activeTab === 2) productLegValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: RemittanceSettingsRepository.ProductMaster.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillTypeStore = () => {
    var parameters = '_database=3601' //add 'xml'.json and get _database values from there
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
  
  
  const fillFunctionStore = () => {
    var parameters = '_database=3605' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setFunctionStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillLanguageStore = () => {
    var parameters = '_database=3606' //add 'xml'.json and get _database values from there
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
    var parameters = '_database=3602' //add 'xml'.json and get _database values from there
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

  const fillCurrencyStore = () => {
    var parameters = '_filter='
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

  const fillPlantStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    })
      .then(res => {
        setPlantStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillDispersalStore = () => {
    const newData = { list: [{ recordId: 1, reference: 'STD', name: 'standard' },{ recordId: 2, reference: 'EXP', name: 'express' }] }
    setDispersalStore(newData.list)
  }

  const fillCoutryStore = () => {
    var parameters = '_filter='
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

  const postProductMaster = obj => { 
    console.log("postProductMaster"); console.log(obj); 
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(true)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const tabs = [
    { label: 'Main' }, 
    { label: 'Countries' }, 
    { label: 'Monetary'}, 
    { label: 'Dispersal' }, 
    { label: 'Schedules' }, 
    { label: 'Fees' }, 
    { label: 'Fields' }, 
    { label: 'Agent' }
  ]

  const delProductMaster = obj => { }

  const addProductMaster = () => {
    productMasterValidation.setValues(getNewProductMaster())
    productLegValidation.setValues({})
    fillTypeStore()
    fillFunctionStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    fillCurrencyStore()
    fillPlantStore()
    fillDispersalStore()
    fillCoutryStore()
    setWindowOpen(true)
  }

  const editProductMaster = obj => {
  }

  const getProductLegGridData = ({ }) => {
    const newData = { list: [{ recordId: 1, fromAmount: 1, toAmount: 10000 }] }
    setProductLegGridData({ ...newData })
  }

  const getProductFieldGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const newData = {
      list: [
        {
          recordId: 1,
          controls: 'beneficiary',
          format: 'Alpha',
          securityLevel: 'Mandatory', //actual combo fills from SY.qryKVS?_database=3605
          specialChars: '@',
          fixedLength: 20,
          minLength: 3,
          maxLength: 20
        },
        {
          recordId: 2,
          controls: 'phone',
          format: 'Alpha',
          securityLevel: 'readOnly', //actual combo fills from SY.qryKVS?_database=3605
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 3,
          controls: 'email',
          format: 'Alpha+SP',
          securityLevel: 'Optional',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 4,
          controls: 'Country',
          format: 'Numeric',
          securityLevel: 'Mandatory',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 5,
          controls: 'City',
          format: 'Alpha Numeric',
          securityLevel: 'hidden',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        }
      ]
    }
    setProductFieldGridData({ ...newData })
  }

  const getProductAgentGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const newData = {
      list: [
        {
          recordId: 1,
          agent: 'ABC'
        },
        {
          recordId: 2,
          agent: 'DEF'
        },
        {
          recordId: 3,
          agent: 'GHI'
        }
      ]
    }
    setProductAgentGridData({ ...newData })
  }

  const getProductCountriesGridData = () => {
    const newData = {
      list: [
        {
          recordId: 1,
          countryRef: 'USA',
          countryName: 'United States',
          isInactive: false
        },
        {
          recordId: 2,
          countryRef: 'LB',
          countryName: 'Lebanon',
          isInactive: true
        },
        {
          recordId: 3,
          countryRef: 'FR',
          countryName: 'France',
          isInactive: true
        },
        {
          recordId: 4,
          countryRef: 'IND',
          countryName: 'India',
          isInactive: false
        },
        {
          recordId: 5,
          countryRef: 'UAE',
          countryName: 'United Arab Emirates',
          isInactive: false
        }
      ]
    }
    setProductCountriesGridData({ ...newData })
  }

  const getProductSchedulesData = () => {
    const newData = {
      list: [
        {
          recordId: 1,
          plant: 'الرياض البطحاء',
          country: 'UAE',
          currency: 'US DOLLAR',
          dispersalMode: 'EXPRESS',
          isInactive: false
        },
        {
          recordId: 2,
          plant: 'ALL',
          country: 'ALL',
          currency: 'ALL',
          dispersalMode: 'ALL',
          isInactive: false
        },
        {
          recordId: 3,
          plant: 'الرياض البطحاء',
          country: 'UAE',
          currency: 'INDIAN RUPEES',
          dispersalMode: 'NTFS',
          isInactive: false
        },
        {
          recordId: 4,
          plant: 'ALL',
          country: 'UAE',
          currency: 'UAE DIRHAMS',
          dispersalMode: 'CASH',
          isInactive: true
        }
      ]
    }
    setProductSchedulesGridData({ ...newData })
  }

  const getProductCurrenciesGridData = () => {
    const newData = {
      list: [
        {
          recordId: 1,
          country: 'United States',
          currency: 'US DOLLAR',
          dispersalType: 'bank',
          isInactive: false
        },
        {
          recordId: 2,
          country: 'United States',
          currency: 'US DOLLAR',
          dispersalType: 'cash',
          isInactive: true
        },
        {
          recordId: 3,
          country: 'India',
          currency: 'INDIAN RUPEES',
          dispersalType: 'bank',
          isInactive: false
        },
        {
          recordId: 4,
          country: 'United Arab Emirates',
          currency: 'UAE DIRHAMS',
          dispersalType: 'bank',
          isInactive: true
        }
      ]
    }
    setProductCurrenciesGridData({ ...newData })
  }

  const getProductDispersalGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const newData = {
      list: [
        {
          recordId: 1,
          reference: 'NTFS',
          name: 'NTFS',
          type: 'bank', //dispersal types fill from KVS 3604
          isDefault: true,
          isInactive: true
        },
        {
          recordId: 2,
          reference: 'CASH',
          name: 'cash',
          type: 'cash',
          isDefault: true,
          isInactive: false
        },
        {
          recordId: 3,
          reference: 'WALLET',
          name: 'wallet (bitcoin)',
          type: 'wallet',
          isDefault: false,
          isInactive: false
        },
        {
          recordId: 4,
          reference: 'CASH DLV',
          name: 'cash delivery',
          type: 'delivery',
          isDefault: false,
          isInactive: true
        }
      ]
    }
    setProductDispersalGridData({ ...newData })
  }

  const editProductCommission = obj => {
    fillCommissionStore()
    setProductLegWindowOpen(true)
  }

  const fillCommissionStore = () => {
    const newData = {
      list: [
        { commissionId: 1, commissionRef: 'PCT', commissionName: 'percentage', commission: 0.5 },
        { commissionId: 2, commissionRef: 'FIX', commissionName: 'fixed', commission: 100 },
        { commissionId: 3, commissionRef: 'OTH', commissionName: 'fixed (other charges)', commission: 150 }
      ]
    }
    setProductLegCommissionGridData({ ...newData })
  }

  const getLabels = () => {
    var parameters = '_dataset=' + ResourceIds.ProductMaster

    getRequest({
      extension: KVSRepository.getLabels,
      parameters: parameters
    })
      .then(res => {
        setLabels(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access)
      getAccess(ResourceIds.ProductMaster, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels()

        getGridData({ _startAt: 0, _pageSize: 30 })

        //for countries tab
        getProductCountriesGridData({})

        //for currencies tab
        getProductCurrenciesGridData({})

        //for product leg tab
        setProductLegWindowOpen(false)
        getProductLegGridData({})

        //for product field tab
        getProductFieldGridData({})
        
        //for schedules tab
        getProductSchedulesData({})

        //for product agent tab
        getProductAgentGridData({})


        //for product dispersal tab
        getProductDispersalGridData({})
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addProductMaster} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editProductMaster}
          onDelete={delProductMaster}
          isLoading={false}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <ProductMasterWindow
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={900}
          height={310}
          onSave={handleSubmit}
          productMasterValidation={productMasterValidation}
          productLegValidation={productLegValidation}
          typeStore={typeStore}
          functionStore={functionStore}
          commissionBaseStore={commissionBaseStore}
          languageStore={languageStore}
          productCountriesGridData={productCountriesGridData}
          productCurrenciesGridData={productCurrenciesGridData}
          productDispersalGridData={productDispersalGridData}
          productLegWindowOpen={productLegWindowOpen}
          productLegGridData={productLegGridData}
          productLegCommissionGridData={productLegCommissionGridData}
          editProductCommission={editProductCommission}
          setProductLegWindowOpen={setProductLegWindowOpen}
          productSchedulesGridData={productSchedulesGridData}
          productFieldGridData={productFieldGridData}
          productAgentGridData={productAgentGridData}
          currencyStore={currencyStore}
          plantStore={plantStore}
          dispersalStore={dispersalStore}
          countryStore={countryStore}
          maxAccess={access}
          labels={_labels}
        />
      )}

      {productLegWindowOpen && (
        <ProductLegWindow
          onClose={() => setProductLegWindowOpen(false)}
          commissionColumns={commissionColumns}
          productLegCommissionGridData={productLegCommissionGridData}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ProductMaster
