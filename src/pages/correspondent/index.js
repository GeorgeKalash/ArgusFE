// ** React Importsport
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

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { getNewCorrespondent, populateCorrespondent } from 'src/Models/RemittanceSettings/Correspondent'
import { getNewCorrExchangeMap, populateCorrExchangeMap } from 'src/Models/RemittanceSettings/CorrExchangeMap'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import CorrespondentWindow from './Windows/CorrespondentWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import CurrencyMapWindow from './Windows/CurrencyMapWindow'

const Correspondent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [bpMasterDataStore, setBpMasterDataStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [exchangeTableStore, setExchangeTableStore] = useState([])
  const [plantStore, setPlantStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [currencyMapWindowOpen, setCurrencyMapWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    bpRef: labels && labels.find(item => item.key === 3).value,
    outward: labels && labels.find(item => item.key === 4).value,
    inward: labels && labels.find(item => item.key === 5).value,
    isInactive: labels && labels.find(item => item.key === 6).value,
    correspondent: labels && labels.find(item => item.key === 7).value,
    country: labels && labels.find(item => item.key === 8).value,
    currency: labels && labels.find(item => item.key === 9).value
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
      field: 'bpRef',
      headerName: _labels.bpRef,
      flex: 1
    },
    {
      field: 'outward',
      headerName: _labels.outward,
      flex: 1
    },
    {
      field: 'inward',
      headerName: _labels.inward,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      flex: 1
    }
  ]

  const tabs = [
    { label: 'Main' },
    { label: 'Countries', disabled: !editMode },
    { label: 'Currencies', disabled: !editMode }
  ]

  const correspondentValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      bpId: yup.string().required('This field is required'),
      bpRef: yup.string().required('This field is required'),
      bpName: yup.string().required('This field is required'),
      outward: yup.string().required('This field is required'),
      inward: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCorrespondent(values)
    }
  })

  // COUNTRIES TAB
  const countriesGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      console.log(values.rows)
      const isValid = values.rows.every(row => !!row.countryId)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ countryId: 'Country ID is required' }) }
    },
    initialValues: {
      rows: [
        {
          //seqNo: 1,
          //seqNo2: 'Seq Nu 2-1', // can send as 1; this is only an example of complex use of valueSetter
          corId: correspondentValidation.values
            ? correspondentValidation.values.recordId
              ? correspondentValidation.values.recordId
              : ''
            : '',
          countryId: '',
          countryRef: '',
          countryName: ''
        }
      ]
    },
    onSubmit: values => {
      console.log({ values })
      postCorrespondentCountries(values.rows)
    }
  })

  const countriesInlineGridColumns = [
    // {
    //   field: 'incremented',
    //   header: 'Seq Nu',
    //   name: 'seqNo',
    //   mandatory: false,
    //   readOnly: true,
    //   valueSetter: () => {
    //     return countriesGridValidation.values.rows.length + 1
    //   }
    // },
    // {
    //   field: 'incremented',
    //   header: 'Seq Nu 2',
    //   name: 'seqNo2',
    //   mandatory: false,
    //   readOnly: true,
    //   valueSetter: () => {
    //     return `Seq Nu 2-${countriesGridValidation.values.rows.length + 1}`
    //   }
    // },
    {
      field: 'combobox',
      header: 'Country Ref',
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
      header: 'Country Name',
      name: 'countryName',
      mandatory: false,
      readOnly: true
    }
  ]

  const postCorrespondentCountries = obj => {
    const data = {
      corId: correspondentValidation.values.recordId,
      correspondentCountries: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentCountry.set2,
      record: JSON.stringify(data)
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

  const getCorrespondentCountries = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_corId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentCountry.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) countriesGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // CURRENCIES TAB
  const currenciesGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.currencyId)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ currencyId: 'Currency is required' }) }
    },
    initialValues: {
      rows: [
        {
          corId: correspondentValidation.values
            ? correspondentValidation.values.recordId
              ? correspondentValidation.values.recordId
              : ''
            : '',
          currencyId: '',
          currencyRef: '',
          currencyName: '',
          glCurrencyId: '',
          glCurrencyRef: '',
          glCurrencyName: '',
          exchangeId: '',
          exchangeRef: '',
          outward: false,
          inward: false,
          bankDeposit: false,
          deal: false,
          isInactive: false
        }
      ]
    },
    onSubmit: values => {
      console.log({ values })
      postCorrespondentCurrencies(values.rows)
    }
  })

  const currenciesInlineGridColumns = [
    {
      field: 'combobox',
      header: 'Currency',
      nameId: 'currencyId',
      name: 'currencyRef',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',

      //fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' },
        { key: 'flName', value: 'FL Name' }
      ]
    },

    // {
    //   field: 'textfield',
    //   header: 'Name',
    //   name: 'currencyName',
    //   mandatory: false,
    //   readOnly: true
    // },
    {
      field: 'combobox',
      header: 'GL Currency',
      nameId: 'glCurrencyId',
      name: 'glCurrencyRef',
      mandatory: true,
      store: currencyStore.list,
      valueField: 'recordId',
      displayField: 'reference',

      //fieldsToUpdate: [{ from: 'name', to: 'GlCurrencyName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' },
        { key: 'flName', value: 'FL Name' }
      ]
    },

    // {
    //   field: 'textfield',
    //   header: 'Name',
    //   name: 'GlCurrencyName',
    //   mandatory: false,
    //   readOnly: true
    // },

    {
      field: 'combobox',
      header: 'Exchange Table',
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: true,
      store: exchangeTableStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'checkbox',
      header: 'Outward',
      name: 'outward'
    },
    {
      field: 'checkbox',
      header: 'Inward',
      name: 'inward'
    },
    {
      field: 'checkbox',
      header: 'Bank Deposit',
      name: 'bankDeposit'
    },
    {
      field: 'checkbox',
      header: 'Deal',
      name: 'deal'
    },
    {
      field: 'checkbox',
      header: 'Is Inactive',
      name: 'isInactive'
    },
    {
      field: 'button',
      text: 'Exchange',
      onClick: (e, row) => {
        exchangeMapValidation.setValues(getNewCorrExchangeMap())
        setCurrencyMapWindowOpen(true)
      }
    }
  ]

  const postCorrespondentCurrencies = obj => {
    const data = {
      corId: correspondentValidation.values.recordId,
      correspondentCurrencies: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentCurrency.set2,
      record: JSON.stringify(data)
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

  const getCorrespondentCurrencies = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_corId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentCurrency.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) currenciesGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //EXCHANGE MAP WINDOW
  const exchangeMapValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      corId: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required')
    }),
    onSubmit: values => {}
  })

  const handleExchangeMapSubmit = () => {
    exchangeMapValidation.handleSubmit()
  }

  const exchangeMapsGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.plantId)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ plantId: 'Plant is required' }) }
    },
    initialValues: {
      rows: [
        {
          corId: correspondentValidation.values
            ? correspondentValidation.values.recordId
              ? correspondentValidation.values.recordId
              : ''
            : '',
          currencyId: '',
          countryId: '',
          plantId: '',
          exchangeId: ''
        }
      ]
    },
    onSubmit: values => {
      console.log(values)
      postExchangeMaps(values)
    }
  })

  const exchangeMapsInlineGridColumns = [
    {
      field: 'combobox',
      header: 'Plant',
      nameId: 'plantId',
      name: 'plantRef',
      mandatory: true,
      store: plantStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'combobox',
      header: 'Exchange Table',
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: true,
      store: exchangeTableStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    }
  ]

  const getCurrenciesExchangeMaps = (corId, currencyId, countryId) => {
    const defaultParams = `_corId=${corId}&_currencyId=${currencyId}&_countryId=${countryId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeMap.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) exchangeMapsGridValidation.setValues({ rows: res.list })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postExchangeMaps = obj => {
    const data = {
      corId: correspondentValidation.values.recordId,
      countryId: correspondentValidation.values.recordId,
      currencyId: correspondentValidation.values.recordId,
      correspondentCurrencies: obj
    }
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeMap.set2,
      record: JSON.stringify(data)
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

  const lookupBpMasterData = searchQry => {
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: BusinessPartnerRepository.MasterData.snapshot,
      parameters: parameters
    })
      .then(res => {
        setBpMasterDataStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    if (activeTab === 0) correspondentValidation.handleSubmit()
    else if (activeTab === 1) countriesGridValidation.handleSubmit()
    else if (activeTab === 2) currenciesGridValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postCorrespondent = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delCorrespondent = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.del,
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

  const fillCountryStore = () => {
    var parameters = `_filter=`
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

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
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

  const fillExchangeTableStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry,
      parameters: parameters
    })
      .then(res => {
        setExchangeTableStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillPlantStore = () => {
    var parameters = `_filter=`
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

  const addCorrespondent = () => {
    correspondentValidation.setValues(getNewCorrespondent())
    fillCountryStore()
    fillCurrencyStore()
    fillExchangeTableStore()
    fillPlantStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const popup = obj => {
    fillCountryStore()
    fillCurrencyStore()
    fillExchangeTableStore()
    fillPlantStore()
    getCorrespondentById(obj)
    getCorrespondentCountries(obj)
    getCorrespondentCurrencies(obj)
  }

  const getCorrespondentById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.Correspondent.get,
      parameters: parameters
    })
      .then(res => {
        correspondentValidation.setValues(populateCorrespondent(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Correspondent, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.Correspondent, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addCorrespondent} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={popup}
          onDelete={delCorrespondent}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <CorrespondentWindow
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setWindowOpen(false)}
          width={1000}
          height={400}
          onSave={handleSubmit}
          editMode={editMode}
          lookupBpMasterData={lookupBpMasterData}
          bpMasterDataStore={bpMasterDataStore}
          setBpMasterDataStore={setBpMasterDataStore}
          correspondentValidation={correspondentValidation}
          //countries tab - inline edit grid
          countriesGridValidation={countriesGridValidation}
          countriesInlineGridColumns={countriesInlineGridColumns}
          //currencies tab - inline edit grid
          currenciesGridValidation={currenciesGridValidation}
          currenciesInlineGridColumns={currenciesInlineGridColumns}
          labels={_labels}
          maxAccess={access}
        />
      )}

      {currencyMapWindowOpen && (
        <CurrencyMapWindow
          onClose={() => setCurrencyMapWindowOpen(false)}
          onSave={handleExchangeMapSubmit}
          exchangeMapsGridValidation={exchangeMapsGridValidation}
          exchangeMapsInlineGridColumns={exchangeMapsInlineGridColumns}
          exchangeMapValidation={exchangeMapValidation}
          countryStore={countryStore.list}
          getCurrenciesExchangeMaps={getCurrenciesExchangeMaps}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Correspondent
