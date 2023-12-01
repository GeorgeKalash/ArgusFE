// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

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
import { getNewProductMaster, populateProductMaster } from 'src/Models/RemittanceSettings/ProductMaster'
import { getNewProductDispersal, populateProductDispersal } from 'src/Models/RemittanceSettings/ProductDispersal'
import {
  getNewProductScheduleRange,
  populateProductScheduleRange
} from 'src/Models/RemittanceSettings/ProductScheduleRange'
import ProductDispersalWindow from './Windows/ProductDispersalWindow'

const ProductMaster = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [dispersalsGridData, setDispersalsGridData] = useState([])
  const [typeStore, setTypeStore] = useState([])
  const [dispersalTypeStore, setDispersalTypeStore] = useState([])
  const [functionStore, setFunctionStore] = useState([])
  const [languageStore, setLanguageStore] = useState([])
  const [commissionBaseStore, setCommissionBaseStore] = useState([])
  const [interfaceStore, setInterfaceStore] = useState([])
  const [agentsStore, setAgentsStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [plantStore, setPlantStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [dispersalStore, setDispersalStore] = useState([])
  const [correspondentStore, setCorrespondentStore] = useState([])

  const [productLegGridData, setProductLegGridData] = useState([]) //for productLegTab
  const [productLegCommissionGridData, setProductLegCommissionGridData] = useState([]) //for productLegTab
  const [productFieldGridData, setProductFieldGridData] = useState([]) //for productFieldTab
  const [productAgentGridData, setProductAgentGridData] = useState([]) //for product agent tab
  const [productCountriesGridData, setProductCountriesGridData] = useState([]) //for countries tab
  const [productCurrenciesGridData, setProductCurrenciesGridData] = useState([]) //for monetary tab
  const [productDispersalGridData, setProductDispersalGridData] = useState([]) //for product dispersal tab

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  const [productLegWindowOpen, setProductLegWindowOpen] = useState(false) //for productLegTab
  const [dispersalWindowOpen, setDispersalWindowOpen] = useState(false)
  const [dispersalEditMode, setDispersalEditMode] = useState(false)

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
      field: 'typeName',
      headerName: 'Type',
      flex: 1
    },
    {
      field: 'functionName',
      headerName: 'Function',
      flex: 1
    },
    {
      field: 'commissionBaseName',
      headerName: 'Commission Base',
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
      flex: 1
    },
    {
      field: 'commissionName',
      headerName: 'Commission Name',
      flex: 1
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
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      type: yup.string().required('This field is required'),
      functionId: yup.string().required('This field is required'),
      commissionBase: yup.string().required('This field is required'),
      isInactive: yup.string().required('This field is required')
    }),
    onSubmit: values => {

      postProductMaster(values)
    }
  })

  const lookupCorrespondent = searchQry => {

    console.log()
    setCorrespondentStore([])
    if(searchQry){
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.snapshot,
      parameters: parameters
    })
      .then(res => {
        console.log(res.list)
        setCorrespondentStore(res.list)
      })
      .catch(error => {
        // setErrorMessage(error)
      })}
  }

  const handleSubmit = () => {
    if (activeTab === 0) productMasterValidation.handleSubmit()
    else if (activeTab === 1) countriesGridValidation.handleSubmit()
    else if (activeTab === 2) monetariesGridValidation.handleSubmit()
    else if (activeTab === 4) schedulesGridValidation.handleSubmit()
    else if (activeTab === 5) scheduleRangeGridValidation.handleSubmit()
    else if (activeTab === 7) agentsGridValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductMaster.page,
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
        setTypeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillDispersalTypeStore = () => {
    var parameters = '_database=3604' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setDispersalTypeStore(res)
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
        setCurrencyStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillInterfaceStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: RemittanceSettingsRepository.Interface.qry,
      parameters: parameters
    })
      .then(res => {
        setInterfaceStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillAgentsStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.qry,
      parameters: parameters
    })
      .then(res => {
        setAgentsStore(res)
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

  const fillCoutryStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postProductMaster = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log(res)
        productMasterValidation.setFieldValue('recordId', res.recordId)
        getGridData({})
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const tabs = [
    { label: 'Main' },
    { label: 'Countries', disabled: !editMode },
    { label: 'Monetary', disabled: !editMode },
    { label: 'Dispersal', disabled: !editMode },
    { label: 'Schedules', disabled: !editMode },
    { label: 'Amount range', disabled: !editMode },
    { label: 'Fields', disabled: !editMode },
    { label: 'Agent', disabled: !editMode }
  ]

  const delProductMaster = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.del,
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

  const addProductMaster = () => {
    productMasterValidation.setValues(getNewProductMaster())
    fillTypeStore()
    fillFunctionStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    fillInterfaceStore()
    fillPlantStore()
    fillAgentsStore()
    fillCoutryStore()
    fillCurrencyStore()
    setWindowOpen(true)
  }

  const popup = obj => {
    fillTypeStore()
    fillFunctionStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    fillInterfaceStore()
    getProductMasterById(obj)
    fillCoutryStore()
    fillPlantStore()
    fillAgentsStore()
    fillCurrencyStore()
    fillDispersalTypeStore()
    resetCorrespondentCountries()
    resetCorrespondentMonetaries()
    resetDispersals()
    resetProductSchedules()
    getCorrespondentCountries(obj)
    getCorrespondentMonetaries(obj)
    getDispersalsGridData(obj)
    getProductSchedules(obj)
    productLegValidation.setValues(getNewProductScheduleRange())
    agentsHeaderValidation.setValues({ dispersalId: null })
  }

  const getProductMasterById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductMaster.get,
      parameters: parameters
    })
      .then(res => {
        productMasterValidation.setValues(populateProductMaster(res.record))
        countriesGridValidation.setValues({
          rows: [
            {
              productId: res.record.recordId,
              countryId: '',
              countryRef: '',
              countryName: '',
              isInactive: false
            }
          ]
        })

        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
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

  //COUNTRIES TAB
  const countriesGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.countryId)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ countryId: 'Country ID is required' }) }
    },
    initialValues: {
      rows: [
        {
          productId: productMasterValidation.values
            ? productMasterValidation.values.recordId
              ? productMasterValidation.values.recordId
              : ''
            : '',
          countryId: '',
          countryRef: '',
          countryName: '',
          isInactive: false
        }
      ]
    },
    onSubmit: values => {
      console.log(productMasterValidation.values.recordId)
      console.log(values.rows)

      postProductCountries(values.rows)
    }
  })

  const countriesInlineGridColumns = [
    {
      field: 'combobox',
      header: 'Country',
      nameId: 'countryId',
      name: 'countryRef',
      mandatory: true,
      store: countryStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'countryName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Country Ref' },
        { key: 'flName', value: 'Foreign Language Name' }
      ]
    },
    {
      field: 'textfield',
      header: 'name',
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'checkbox',
      header: 'is inactive',
      name: 'isInactive'
    }
  ]

  const postProductCountries = obj => {
    const data = {
      productId: productMasterValidation.values.recordId,
      productCountries: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductCountries.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetCorrespondentCountries = () => {
    countriesGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: productMasterValidation.values
              ? productMasterValidation.values.recordId
                ? productMasterValidation.values.recordId
                : ''
              : '',
            countryId: '',
            countryRef: '',
            countryName: '',
            isInactive: false
          }
        ]
      }
    })
  }

  const getCorrespondentCountries = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_productId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductCountries.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) countriesGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //MONETARY TAB
  const monetariesGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.countryId)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ countryId: 'Country ID is required' }) }
    },
    initialValues: {
      rows: [
        {
          productId: productMasterValidation.values
            ? productMasterValidation.values.recordId
              ? productMasterValidation.values.recordId
              : ''
            : '',
          countryId: '',
          countryRef: '',
          countryName: '',
          currencyId: '',
          currencyRef: '',
          currencyName: '',
          dispersalType: '',
          dispersalTypeName: '',
          isInactive: false
        }
      ]
    },
    onSubmit: values => {
      postProductMonetaries(values.rows)
    }
  })

  const monetariesInlineGridColumns = [
    {
      field: 'combobox',
      header: 'Country',
      nameId: 'countryId',
      name: 'countryRef',
      mandatory: true,
      store: countryStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'countryName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Country Ref' },
        { key: 'flName', value: 'Foreign Language Name' }
      ]
    },
    {
      field: 'textfield',
      header: 'name',
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'combobox',
      header: 'Currency',
      nameId: 'currencyId',
      name: 'currencyRef',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Currency Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'textfield',
      header: 'name',
      name: 'currencyName',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'combobox',
      header: 'Dispersal Type',
      nameId: 'dispersalType',
      name: 'dispersalTypeName',
      mandatory: false,
      store: dispersalTypeStore.list,
      valueField: 'key',
      displayField: 'value',
      fieldsToUpdate: [{ from: 'value', to: 'dispersalTypeName' }],
      columnsInDropDown: [{ key: 'value', value: '' }]
    },
    {
      field: 'checkbox',
      header: 'is inactive',
      name: 'isInactive'
    }
  ]

  const postProductMonetaries = obj => {
    const data = {
      productId: productMasterValidation.values.recordId,
      productMonetaries: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductMonetaries.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetCorrespondentMonetaries = () => {
    monetariesGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: productMasterValidation.values
              ? productMasterValidation.values.recordId
                ? productMasterValidation.values.recordId
                : ''
              : '',
            countryId: '',
            countryRef: '',
            countryName: '',
            currencyId: '',
            currencyRef: '',
            currencyName: '',
            dispersalType: '',
            dispersalTypeName: '',
            isInactive: false
          }
        ]
      }
    })
  }

  const getCorrespondentMonetaries = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_productId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductMonetaries.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) monetariesGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //DISPERSAL TAB

  const productDispersalValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      productId: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required'),
      isDefault: yup.string().required('This field is required'),
      isInactive: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postProductDispersal(values)
    }
  })

  const postProductDispersal = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getDispersalsGridData(obj)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetDispersals = () => {}

  const getDispersalsGridData = obj => {
    const defaultParams = `_productId=${obj.recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.qry,
      parameters: parameters
    })
      .then(res => {
        setDispersalsGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delProductDispersal = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.del,
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

  const addProductDispersal = () => {
    productDispersalValidation.setValues(getNewProductDispersal(productMasterValidation.values.recordId))
    setDispersalWindowOpen(true)
  }

  const popupDispersal = obj => {
    getDispersalById(obj)
  }

  const getDispersalById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.get,
      parameters: parameters
    })
      .then(res => {
        productDispersalValidation.setValues(populateProductDispersal(res.record))
        setDispersalEditMode(true)
        setDispersalWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleDispersalSubmit = () => {
    productDispersalValidation.handleSubmit()
  }

  //SCHEDULES TAB - INLINE EDIT GRID
  const schedulesGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.countryId)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ countryId: 'Country ID is required' }) }
    },
    initialValues: {
      rows: [
        {
          productId: productMasterValidation.values
            ? productMasterValidation.values.recordId
              ? productMasterValidation.values.recordId
              : ''
            : '',
          seqNo: 1,
          plantId: '',
          plantRef: '',
          plantName: '',
          countryId: '',
          countryRef: '',
          countryName: '',
          currencyId: '',
          currencyRef: '',
          currencyName: '',
          dispersalType: '',
          dispersalTypeName: '',
          isInactive: false
        }
      ]
    },
    onSubmit: values => {
      postProductSchedules(values.rows)
    }
  })

  const schedulesInlineGridColumns = [
    {
      field: 'incremented',
      header: 'Seq No',
      name: 'seqNo',
      mandatory: false,
      readOnly: true,
      valueSetter: () => {
        return schedulesGridValidation.values.rows.length + 1
      }
    },
    {
      field: 'button',
      text: 'select',
      onClick: (e, row) => {
        productLegValidation.setValues(populateProductScheduleRange(row))
        getCorrespondentScheduleRange(row)
      }
    },
    {
      field: 'combobox',
      header: 'Country',
      nameId: 'countryId',
      name: 'countryRef',
      mandatory: true,
      store: countryStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'countryName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Country Ref' },
        { key: 'flName', value: 'Foreign Language Name' }
      ]
    },
    {
      field: 'textfield',
      header: 'name',
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'combobox',
      header: 'plant',
      nameId: 'plantId',
      name: 'plantRef',
      mandatory: true,
      store: plantStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'plantName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'textfield',
      header: 'name',
      name: 'plantName',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'combobox',
      header: 'Currency',
      nameId: 'currencyId',
      name: 'currencyRef',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Currency Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'textfield',
      header: 'name',
      name: 'currencyName',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'combobox',
      header: 'Dispersal',
      nameId: 'dispersalId',
      name: 'dispersalRef',
      mandatory: true,
      store: dispersalsGridData.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [
        { from: 'name', to: 'dispersalName' },
        { from: 'dispersalType', to: 'dispersalType' },
        { from: 'dispersalTypeName', to: 'dispersalTypeName' }
      ],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'textfield',
      header: 'name',
      name: 'dispersalName',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'combobox',
      header: 'Dispersal Type',
      nameId: 'dispersalType',
      name: 'dispersalTypeName',
      mandatory: false,
      store: dispersalTypeStore.list,
      valueField: 'key',
      displayField: 'value',
      readOnly: true
    },
    {
      field: 'checkbox',
      header: 'is inactive',
      name: 'isInactive'
    }
  ]

  const postProductSchedules = obj => {
    const data = {
      productId: productMasterValidation.values.recordId,
      productSchedules: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductSchedules.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetProductSchedules = () => {
    schedulesGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: productMasterValidation.values
              ? productMasterValidation.values.recordId
                ? productMasterValidation.values.recordId
                : ''
              : '',
            seqNo: 1,
            plantId: '',
            plantRef: '',
            plantName: '',
            countryId: '',
            countryRef: '',
            countryName: '',
            currencyId: '',
            currencyRef: '',
            currencyName: '',
            dispersalType: '',
            dispersalTypeName: '',
            isInactive: false
          }
        ]
      }
    })
  }

  const getProductSchedules = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_productId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductSchedules.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) schedulesGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //SCHEDULE LEG HEADER

  const productLegValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      seqNo: yup.string().required('This field is required'),
      plantId: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      dispersalId: yup.string().required('This field is required')
    }),
    onSubmit: values => {}
  })

  //SCHEDULE RANGE INLINE EDIT GRID

  const scheduleRangeGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.fromAmount)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ fromAmount: 'Country ID is required' }) }
    },
    initialValues: {
      rows: [
        {
          productId: productLegValidation.values
            ? productLegValidation.values.productId
              ? productLegValidation.values.productId
              : ''
            : '',
          seqNo: '',
          rangeSeqNo: 1, //incremental
          fromAmount: '',
          toAmount: ''
        }
      ]
    },
    onSubmit: values => {
      postProductScheduleRange(values.rows)
    }
  })

  const scheduleRangeInlineGridColumns = [
    {
      field: 'incremented',
      header: 'Seq No',
      name: 'rangeSeqNo',
      mandatory: false,
      readOnly: true,
      valueSetter: () => {
        return scheduleRangeGridValidation.values.rows.length + 1
      }
    },
    {
      field: 'textfield',
      header: 'from amount',
      name: 'fromAmount',
      mandatory: true,
      readOnly: false
    },
    {
      field: 'textfield',
      header: 'to amount',
      name: 'toAmount',
      mandatory: true,
      readOnly: false
    },
    {
      field: 'button',
      text: 'commission',
      onClick: (e, row) => {
        productLegValidation.setValues(populateProductScheduleRange(row))
        getCorrespondentScheduleRange(row)
      }
    }
  ]

  const postProductScheduleRange = obj => {
    console.log(productLegValidation)

    const data = {
      productId: productLegValidation.values.productId,
      seqNo: productLegValidation.values.seqNo,
      productScheduleRanges: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductScheduleRanges.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getCorrespondentScheduleRange = obj => {
    const _productId = obj.productId
    const _seqNo = obj.seqNo
    const defaultParams = `_productId=${_productId}&_seqNo=${_seqNo}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductScheduleRanges.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) scheduleRangeGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //AGENTS TAB
  const agentsHeaderValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      dispersalId: yup.string().required('This field is required')
    }),
    onSubmit: values => {}
  })

  const agentsGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.agentId)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ agentId: 'Agent ID is required' }) }
    },
    initialValues: {
      rows: [
        {
          dispersalId: agentsHeaderValidation.values
            ? agentsHeaderValidation.values.dispersalId
              ? agentsHeaderValidation.values.dispersalId
              : ''
            : '',
          agentId: '',
          agentName: ''
        }
      ]
    },
    onSubmit: values => {
      postProductAgents(values.rows)
    }
  })

  const agentsInlineGridColumns = [
    {
      field: 'combobox',
      header: 'Agents',
      nameId: 'agentId',
      name: 'agentName',
      mandatory: false,
      store: agentsStore.list,
      valueField: 'recordId',
      displayField: 'name',
      fieldsToUpdate: [{ from: 'name', to: 'agentName' }],
      columnsInDropDown: [{ key: 'name', value: '' }]
    }
  ]

  const postProductAgents = obj => {
    const data = {
      dispersalId: productMasterValidation.values.recordId,
      productSchedules: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductDispersalAgents.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const onDispersalSelection = dispersalId => {
    const dipersalId = dispersalId
    const defaultParams = `_dispersalId=${dipersalId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersalAgents.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) agentsGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
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

  useEffect(() => {
    if (!access) getAccess(ResourceIds.ProductMaster, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        //for product leg tab
        setProductLegWindowOpen(false)

        //for product field tab
        getProductFieldGridData({})

        //for product agent tab
        getProductAgentGridData({})

        fillPlantStore()
        fillCoutryStore()
        fillCurrencyStore()

        // fillCorrespondentStore()
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
          onEdit={popup}
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
          width={1050}
          height={310}
          onSave={handleSubmit}
          productMasterValidation={productMasterValidation}
          typeStore={typeStore}
          functionStore={functionStore}
          commissionBaseStore={commissionBaseStore}
          interfaceStore={interfaceStore}
          languageStore={languageStore}

          //countries inline edit grid
          countriesGridValidation={countriesGridValidation}
          countriesInlineGridColumns={countriesInlineGridColumns}

          //monetaries inline edit grid
          monetariesGridValidation={monetariesGridValidation}
          monetariesInlineGridColumns={monetariesInlineGridColumns}

          //dispersals tab (grid)
          dispersalsGridData={dispersalsGridData}
          getDispersalsGridData={getDispersalsGridData}
          addProductDispersal={addProductDispersal}
          delProductDispersal={delProductDispersal}
          popupDispersal={popupDispersal}

          //schedules inline edit grid
          schedulesGridValidation={schedulesGridValidation}
          schedulesInlineGridColumns={schedulesInlineGridColumns}

          //schedule ranges tab
          productLegValidation={productLegValidation}
          currencyStore={currencyStore}
          plantStore={plantStore}
          countryStore={countryStore}
          dispersalStore={dispersalStore}
          scheduleRangeGridValidation={scheduleRangeGridValidation}
          scheduleRangeInlineGridColumns={scheduleRangeInlineGridColumns}

          //agents tab inline edit grid
          agentsHeaderValidation={agentsHeaderValidation}
          agentsGridValidation={agentsGridValidation}
          agentsInlineGridColumns={agentsInlineGridColumns}
          onDispersalSelection={onDispersalSelection}
          productCountriesGridData={productCountriesGridData}
          productCurrenciesGridData={productCurrenciesGridData}
          productDispersalGridData={productDispersalGridData}
          productLegWindowOpen={productLegWindowOpen}
          productLegGridData={productLegGridData}
          productLegCommissionGridData={productLegCommissionGridData}
          editProductCommission={editProductCommission}
          setProductLegWindowOpen={setProductLegWindowOpen}
          productFieldGridData={productFieldGridData}
          productAgentGridData={productAgentGridData}
          correspondentStore={correspondentStore}
          setCorrespondentStore={setCorrespondentStore}
          maxAccess={access}
          lookupCorrespondent={lookupCorrespondent}
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

      {dispersalWindowOpen && (
        <ProductDispersalWindow
          onClose={() => setDispersalWindowOpen(false)}
          onSave={handleDispersalSubmit}
          productDispersalValidation={productDispersalValidation}
          dispersalTypeStore={dispersalTypeStore.list}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ProductMaster
