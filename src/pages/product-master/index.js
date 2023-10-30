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

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { getFormattedNumber } from 'src/lib/numberField-helper'

// ** Windows
import ProductMasterWindow from './Windows/ProductMasterWindow'
import ProductLegWindow from './Windows/ProductLegWindow'

// ** Tabs
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductMaster = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [typeStore, setTypeStore] = useState([])
  const [languageStore, setLanguageStore] = useState([])
  const [commissionBaseStore, setCommissionBaseStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [plantStore, setPlantStore] = useState([])
  const [countryStore, setCountryStore] = useState([])

  const [productLegGridData, setProductLegGridData] = useState([]) //for productLegTab
  const [productLegCommissionGridData, setProductLegCommissionGridData] = useState([]) //for productLegTab
  const [productFieldGridData, setProductFieldGridData] = useState([]) //for productFieldTab
  const [productAgentGridData, setProductAgentGridData] = useState([]) //for product agent tab
  const [productDispersalGridData, setProductDispersalGridData] = useState([]) //for product dispersal tab

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  const [productLegWindowOpen, setProductLegWindowOpen] = useState(false) //for productLegTab
  

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
      correspondant: yup.string().nullable(),
      countryId: yup.string().required('This field is required'),
      currencyId: yup.string().nullable(),
      language: yup.string().required('This field is required'),
      interfaceId: yup.string().nullable(),
      commissionBase: yup.string().nullable(),
      posMsg: yup.string().nullable(),
      posMsgIsActive: yup.string().nullable(),
      isInactive: yup.string().nullable(),

      //not needed if going to be conditionaly changed according to another field value
      // correspondant: yup.string().required('This field is required'),
    }),
    onSubmit: values => {
      postProductMaster(values)
    }
  })

  const productLegValidation = useFormik({
    plantId: yup.string().required('This field is required'),
    currencyId: yup.string().required('This field is required'),
  })

  const handleSubmit = () => {
    if (activeTab === 0) productMasterValidation.handleSubmit()
    else if (activeTab === 2) productLegValidation.handleSubmit()
  }

  const getGridData = () => { }

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

  const postProductMaster = obj => { console.log("postProductMaster"); console.log(obj); }

  const tabs = [{ label: 'Main' }, { label: 'Dispersal' }, { label: 'Leg' }, { label: 'Fields' }, { label: 'Agent' }]

  const delProductMaster = obj => { }

  const addProductMaster = () => {
    productMasterValidation.setValues({})
    productLegValidation.setValues({})
    fillTypeStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    fillCurrencyStore()
    fillPlantStore()
    fillCoutryStore()
    setWindowOpen(true)
  }

  const editProductMaster = obj => {
  }

  const getProductLegGridData = ({ }) => {
    const newData = { list: [{ recordId: 1, fromAmount: 1000.66, toAmount: 2000.97 }] }
    setProductLegGridData({ ...newData })
  }

  const getProductFieldGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const newData = {
      list: [
        {
          recordId: 1,
          controls: 'phone',
          format: 'Alfa',
          securityLevel: 'readOnly', //actual combo fills from SY.qryKVS?_database=3605
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 2,
          controls: 'email',
          format: 'Alfa+SP',
          securityLevel: 'Optional',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 3,
          controls: 'Country',
          format: 'Numeric',
          securityLevel: 'Mandatory',
          specialChars: '@',
          fixedLength: 10,
          minLength: 3,
          maxLength: 10
        },
        {
          recordId: 4,
          controls: 'City',
          format: 'Alfa Numeric',
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
        { commissionId: 1, commissionName: 'PCT', commission: 50 },
        { commissionId: 2, commissionName: 'fixed', commission: 100 },
        { commissionId: 3, commissionName: 'fixed (other charges)', commission: 150 }
      ]
    }
    setProductLegCommissionGridData({ ...newData })
  }

  useEffect(() => {
    if (!access)
      getAccess(ResourceIds.ProductMaster, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        //for product leg tab
        setProductLegWindowOpen(false)
        getProductLegGridData({})

        //for product field tab
        getProductFieldGridData({})

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
          height={350}
          onSave={handleSubmit}
          productMasterValidation={productMasterValidation}
          productLegValidation={productLegValidation}
          typeStore={typeStore}
          commissionBaseStore={commissionBaseStore}
          languageStore={languageStore}
          productDispersalGridData={productDispersalGridData}
          productLegWindowOpen={productLegWindowOpen}
          productLegGridData={productLegGridData}
          productLegCommissionGridData={productLegCommissionGridData}
          editProductCommission={editProductCommission}
          setProductLegWindowOpen={setProductLegWindowOpen}
          productFieldGridData={productFieldGridData}
          productAgentGridData={productAgentGridData}
          currencyStore={currencyStore}
          plantStore={plantStore}
          countryStore={countryStore}
          maxAccess={access}
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
