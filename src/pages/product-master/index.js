// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { getFormattedNumber } from 'src/lib/numberField-helper'

// ** Windows
import ProductMasterWindow from './Windows/ProductMasterWindow'
import ProductLegWindow from './Windows/ProductLegWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { getNewProductMaster, populateProductMaster } from 'src/Models/RemittanceSettings/ProductMaster'
import { getNewProductDispersal, populateProductDispersal } from 'src/Models/RemittanceSettings/ProductDispersal'
import {
  getNewProductScheduleRange,
  populateProductScheduleRange
} from 'src/Models/RemittanceSettings/ProductScheduleRange'
import ProductDispersalWindow from './Windows/ProductDispersalWindow'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const ProductMaster = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

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
  const[type, setType] = useState(0)

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

  const productMasterValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: windowOpen && yup.object({
      reference:  yup.string().required('This field is required'),
      name:  yup.string().required('This field is required'),
      type:  yup.string().required('This field is required'),
      functionId:  yup.string().required('This field is required'),
      interfaceId:  yup.string().required('This field is required'),
      commissionBase:  yup.string().required('This field is required'),
      isInactive:  yup.string().required('This field is required'),
      corId : type===1 ? yup.string().required('This field is required') : yup.string().notRequired()
    }),
    onSubmit: values => {
      postProductMaster(values)
    }
  })

useEffect(()=>{
setType(productMasterValidation.values && productMasterValidation.values.type)
}, [productMasterValidation])


  const lookupCorrespondent = searchQry => {

    setCorrespondentStore([])
    if(searchQry){
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.snapshot,
      parameters: parameters
    })
      .then(res => {
        setCorrespondentStore(res.list)
      })
      .catch(error => {
         setErrorMessage(error)
      })}
  }

  const handleSubmit = () => {
    if (activeTab === 0) productMasterValidation.handleSubmit()
    else if (activeTab === 1) countriesGridValidation.handleSubmit()
    else if (activeTab === 2) monetariesGridValidation.handleSubmit()
    else if (activeTab === 3) dispersalsGridData.handleSubmit()

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
    getAllKvsByDataset({
      _dataset: DataSets.RT_Product_Type,
      callback: setTypeStore
    })
  }

  const fillDispersalTypeStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.RT_Dispersal_Type,
      callback: setDispersalTypeStore
    })
  }

  const fillFunctionStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.RT_Function,
      callback: setFunctionStore
    })
  }

  const fillLanguageStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.RT_Language,
      callback: setLanguageStore
    })
  }

  const fillCommissionBaseStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.RT_Commission_Base,
      callback: setCommissionBaseStore
    })
  }

  const fillCurrencyStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res);
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
        setPlantStore(res);

      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCountryStore =  () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res);
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
        productMasterValidation.setFieldValue('recordId', res.recordId)
        getGridData({})
        if (!recordId){

        toast.success('Record Added Successfully')
        productMasterValidation.setFieldValue("recordId", res.recordId)
        resetCorrespondentCountries(res.recordId)
        resetCorrespondentMonetaries(res.recordId)
        resetScheduleRangeGridValidation(res.recordId)
        resetProductSchedules(res.recordId)

        setEditMode(true)

        }else{
          toast.success('Record Editted Successfully')
        }

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
    setEditMode(false)
    productMasterValidation.setValues(getNewProductMaster())
    resetCorrespondentCountries('')
    resetCorrespondentMonetaries('')
    resetDispersals()
    resetProductSchedules('')
    setDispersalsGridData([])
    fillTypeStore()
    fillFunctionStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    fillInterfaceStore()
    fillPlantStore()
    fillAgentsStore()
    fillCountryStore()
    fillCurrencyStore()
    fillDispersalTypeStore()
    setWindowOpen(true)
    setActiveTab(0)
    agentsHeaderValidation.setValues({ dispersalId: null })

  }

  const popup = obj => {
    resetCorrespondentCountries(obj.recordId)
    resetCorrespondentMonetaries(obj.recordId)
    setActiveTab(0)
    fillTypeStore()
    fillFunctionStore()
    fillLanguageStore()
    fillCommissionBaseStore()
    fillInterfaceStore()
    fillCountryStore()
    fillPlantStore()
    fillAgentsStore()
    fillCurrencyStore()
    fillDispersalTypeStore()
    resetDispersals()
    resetProductSchedules(obj.recordId)
    getProductMasterById(obj)
    getCorrespondentCountries(obj)
    getCorrespondentMonetaries(obj)
    getDispersalsGridData(obj.recordId)
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
          securityLevel: 'Mandatory', 
          specialChars: '@',
          fixedLength: 20,
          minLength: 3,
          maxLength: 20
        },
        {
          recordId: 2,
          controls: 'phone',
          format: 'Alpha',
          securityLevel: 'readOnly', 
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
        { key: 'reference', value: 'Reference' },
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



  const resetCorrespondentCountries = (recordId) => {
    countriesGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: recordId ? recordId : '',
            countryId: '',
            countryRef: '',
            countryName: '',
            isInactive: false
          }
        ]
      }
    })
  }

  const resetScheduleRangeGridValidation = (recordId) => {
    scheduleRangeGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: recordId ?recordId : '',
            seqNo: '',

            //seqNo: row.seqNo? row.seqNo : '',
            rangeSeqNo: 1, //incremental
            fromAmount: '',
            toAmount: ''
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
        else resetCorrespondentCountries(_recordId)
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
      store: countriesGridValidation.values?.rows,
      valueField: 'countryId',
      displayField: 'countryRef',
      widthDropDown: '300',
      fieldsToUpdate: [{ from: 'countryName', to: 'countryName' }],
      columnsInDropDown: [
        { key: 'countryRef', value: 'Reference' },
        { key: 'countryName', value: 'Name' }
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
      widthDropDown: '300',
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: '300',
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
      mandatory: true,
      store: dispersalTypeStore,
      valueField: 'key',
      displayField: 'value',
      widthDropDown: '150',
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

  const resetCorrespondentMonetaries = (recordId) => {
    monetariesGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: recordId ? recordId : '',
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
        else resetCorrespondentMonetaries(obj.recordId)
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
    const productId = obj.productId  ? obj.productId : productMasterValidation.values.recordId
    postRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        }
        else toast.success('Record Editted Successfully')

        setDispersalWindowOpen(false)
        getDispersalsGridData(productId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetDispersals = () => {}

  const getDispersalsGridData = productId => {
    setDispersalsGridData([]);
    const defaultParams = `_productId=${productId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.qry,
      parameters: parameters
    })
      .then(res => {
          setDispersalsGridData(res);

          setDispersalStore(res.list);

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
        toast.success('Record Deleted Successfully')
        getDispersalsGridData(obj.productId)
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
      const isValidDispersalId = values.rows.every(row => !!row.dispersalId)

      return (isValidDispersalId )? {} : { rows: Array(values.rows.length).fill({ dispersalId: 'dispersalId is required' }) }
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
          dispersalId:'',
          dispersalName :'',
          dispersalRef:'',
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
      hidden: true,
      valueSetter: () => {
        return schedulesGridValidation.values.rows.length + 1
      }
    },
    {
      field: 'button',
      text: 'select',
      onClick: (e, row) => {
        productLegValidation.setValues(populateProductScheduleRange(row))
        resetScheduleRanges(row)
        getCorrespondentScheduleRange(row)
      }
    },
    {
      field: 'combobox',
      header: 'Country',
      nameId: 'countryId',
      name: 'countryRef',
      mandatory: false,
      store: countriesGridValidation.values?.rows,
      valueField: 'countryId',
      displayField: 'countryRef',
      widthDropDown: '300',
      fieldsToUpdate: [{ from: 'countryName', to: 'countryName' }],
      columnsInDropDown: [
        { key: 'countryRef', value: 'Reference' },
        { key: 'countryName', value: 'Name' }
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
      mandatory: false,
      store: plantStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: '300',
      fieldsToUpdate: [{ from: 'name', to: 'plantName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
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
      mandatory: false,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: '300',
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
      widthDropDown: '300',
      fieldsToUpdate: [
        { from: 'name', to: 'dispersalName' },
        { from: 'dispersalType', to: 'dispersalType' },
        { from: 'dispersalTypeName', to: 'dispersalTypeName' }
      ],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
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
      store: dispersalTypeStore,
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

  const resetProductSchedules = (recordId) => {
    schedulesGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: recordId ? recordId : '',
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
            dispersalId: '',
            dispersalName:'',
            dispersalRef:'',
            dispersalTypeId: '',
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
        else resetProductSchedules(_recordId)
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
  const resetScheduleRanges = (row) => {
    productLegValidation.setValues(row)
    scheduleRangeGridValidation.resetForm({
      values: {
        rows: [
          {
            productId: row.productId? row.productId : '',
            seqNo: row.seqNo? row.seqNo : '',
            rangeSeqNo: 1, //incremental
            fromAmount: '',
            toAmount: ''
          }
        ]
      }
    })
  }

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
      hidden: true,
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
        productCommissionValidation.setValues(row)
        getCorrespondentCommissions(row)
      }
    }
  ]

  const postProductScheduleRange = obj => {

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
        else resetScheduleRanges(obj)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //COMMISSIONS WINDOW
  const handleCommissionSubmit = () => {
    commissionsGridValidation.handleSubmit()
  }

  const productCommissionValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      productId: yup.string().required('This field is required'),
      seqNo: yup.string().required('This field is required'),
      rangeSeqNo: yup.string().required('This field is required')
    }),
    onSubmit: values => {}
  })

  const commissionsGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      // const isValid = values.rows.every(row => !!row.commission)

      // return isValid ? {} : { rows: Array(values.rows.length).fill({ commission: 'commission is required' }) }
    },
    initialValues: {
      rows: [
        {
          productId: '',
          seqNo: '',
          rangeSeqNo: '',
          commissionId: '',
          commissionName: '',
          commission: '',
        }
      ]

    },
    onSubmit: values => {
      postProductRangeCommissions(values.rows)
    }
  })

  const rangeCommissionsInlineGridColumns = [
    {
      field: 'textfield',
      header: 'Commission Type',
      name: 'commissionName',
      mandatory: true,
      readOnly: true
    },
    {
      field: 'textfield',
      header: 'Commission',
      name: 'commission',
      mandatory: true,
      readOnly: false
    }
  ]

  const postProductRangeCommissions = obj => {

    const data = {
      productId: productCommissionValidation.values.productId,
      seqNo: productCommissionValidation.values.seqNo,
      rangeSeqNo: productCommissionValidation.values.rangeSeqNo,
      productScheduleFees: obj.filter(item => item.commission > 0)
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductScheduleFees.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getCorrespondentCommissions = obj => {
    //step 1: get all commission types
    var parameters = '_filter='
    getRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.qry,
      parameters: parameters
    })
      .then(commissionTypes => {

        //step 2: get all ranges commissions
        const _productId = obj.productId
        const _seqNo = obj.seqNo
        const _rangeSeqNo = obj.rangeSeqNo
        const defaultParams = `_productId=${_productId}&_seqNo=${_seqNo}&_rangeSeqNo=${_rangeSeqNo}`
        var parameters = defaultParams
        getRequest({
          extension: RemittanceSettingsRepository.ProductScheduleFees.qry, //qryPSF
          parameters: parameters
        })
          .then(commissionFees => {

            // Create a mapping of commissionId to commissionFees entry for efficient lookup
              const commissionFeesMap = commissionFees.list.reduce((acc, fee) => {
                acc[fee.commissionId] = fee.commission;

                return acc;
              }, {});

              // Combine commissionTypes and commissionFees
              const rows = commissionTypes.list.map(commissionType => {
                const commissionValue = commissionFeesMap[commissionType.recordId] || 0;

                return {
                  productId: obj.productId,
                  seqNo: obj.seqNo,
                  rangeSeqNo: obj.rangeSeqNo,
                  commissionId: commissionType.recordId,
                  commissionName: commissionType.name,
                  commission: commissionValue
                };
              });

              commissionsGridValidation.setValues({ rows })
              setProductLegWindowOpen(true)
          })
          .catch(error => {
            setErrorMessage(error)
          })

      })
      .catch(error => {
        setErrorMessage(error)
      })



    //step 3: merge both
  }

  //AGENTS TAB
  const resetAgents = (dispersalId) => {
    agentsGridValidation.resetForm({
      values: {
        rows: [
          {
            dispersalId: dispersalId,
            agentId: '',
            agentName: ''
          }
        ]
      }
    })
  }

  const agentsHeaderValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: windowOpen && yup.object({
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
      mandatory: true,
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
      productDispersalAgents: obj
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

    const _dispersalId = dispersalId
    const defaultParams = `_dispersalId=${_dispersalId}`
    var parameters = defaultParams
    agentsGridValidation.setValues({ rows: [] })

    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersalAgents.qry,
      parameters: parameters
    })
      .then(res => {
        resetAgents(dispersalId)
        if (res.list.length > 0) {
          agentsGridValidation.setValues({ rows: res.list })
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
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

        fillPlantStore()
        fillCountryStore()
        fillCurrencyStore()

        // fillCorrespondentStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          onSave={handleCommissionSubmit}
          rangeCommissionsInlineGridColumns={rangeCommissionsInlineGridColumns}
          commissionsGridValidation={commissionsGridValidation}
          maxAccess={access}
        />
      )}

      {dispersalWindowOpen && (
        <ProductDispersalWindow
          onClose={() => setDispersalWindowOpen(false)}
          onSave={handleDispersalSubmit}
          productDispersalValidation={productDispersalValidation}
          dispersalTypeStore={dispersalTypeStore}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ProductMaster
