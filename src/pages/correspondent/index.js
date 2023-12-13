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
import ExchangeMapWindow from './Windows/ExchangeMapWindow'

const Correspondent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [corId, setCorId] = useState(null)

  const [bpMasterDataStore, setBpMasterDataStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])
  const [exchangeTableStore, setExchangeTableStore] = useState([])
  const [exchangeTableStoreAll, setExchangeTableStoreAll] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [exchangeMapWindowOpen, setExchangeMapWindowOpen] = useState(false)
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
    currency: labels && labels.find(item => item.key === 9).value,
    glCurrency: labels && labels.find(item => item.key === 10).value,
    exchangeTable: labels && labels.find(item => item.key === 11).value,
    bankDeposit: labels && labels.find(item => item.key === 12).value,
    deal: labels && labels.find(item => item.key === 13).value,
    exchange: labels && labels.find(item => item.key === 14).value,
    plant: labels && labels.find(item => item.key === 15).value,
    exchangeMap: labels && labels.find(item => item.key === 16).value
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
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      bpId: yup.string().required('This field is required'),
      bpRef: yup.string().required('This field is required'),
      bpName: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCorrespondent(values)
    }
  })


  // COUNTRIES TAB
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
          //seqNo: 1,
          //seqNo2: 'Seq Nu 2-1', // can send as 1; this is only an example of complex use of valueSetter
          corId: correspondentValidation.values
            ? correspondentValidation.values.recordId
              ? correspondentValidation.values.recordId
              : ''
            : '',
          countryId: '',
          countryRef: '',
          countryName: '',
          flName:''
        }
      ]
    },
    onSubmit: values => {

      postCorrespondentCountries(values.rows)
    }
  })

  const countriesInlineGridColumns = [
    {
      field: 'combobox',
      header: _labels.country,
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
      header: _labels.name,
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

        // setWindowOpen(false)
        if (!res.recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getCorrespondentCountries = obj => {
    const _recordId = obj.recordId
    console.log('obj.recordId')
    const defaultParams = `_corId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentCountry.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) {

          countriesGridValidation.setValues({ rows: res.list })
        } else {
          countriesGridValidation.setValues({
            rows: [
              {
                corId: _recordId,
                countryId: '',
                countryRef: '',
                countryName: '',
                flName: '',
              }
            ]
          })
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // CURRENCIES TAB
  const currenciesGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.currencyId)
      const isValidGlCurrencyId = values.rows.every(row => !!row.glCurrencyId)


return isValid  && isValidGlCurrencyId ? {} : { rows: Array(values.rows.length).fill({ currencyId: 'Currency is required' }) }
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
          exchangeName: '',
          outward: false,
          inward: false,
          bankDeposit: false,
          deal: false,
          isInactive: false
        }
      ]
    },
    onSubmit: values => {
      postCorrespondentCurrencies(values.rows)
    }
  })

  const currenciesInlineGridColumns = [
    {
      field: 'combobox',
      header: _labels.currency,
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
    {
      field: 'combobox',
      header: _labels.glCurrency,
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
    },{
      field: 'combobox',
      header: _labels.exchange,
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: false,
      store: exchangeTableStoreAll.list,
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
      header: _labels.outward,
      name: 'outward'
    },
    {
      field: 'checkbox',
      header: _labels.inward,
      name: 'inward'
    },
    {
      field: 'checkbox',
      header: _labels.bankDeposit,
      name: 'bankDeposit'
    },
    {
      field: 'checkbox',
      header: _labels.deal,
      name: 'deal'
    },
    {
      field: 'checkbox',
      header: _labels.isInactive,
      name: 'isInactive'
    },
    {
      field: 'button',
      text: 'Exchange',
      disabled: row => row.currencyId < 1,

      onClick: (e, row) => {
        console.log(row)
        exchangeMapValidation.setValues({})

        if (row.currencyId) {
          fillExchangeTableStore(row.currencyId)
          exchangeMapValidation.setValues(row)
          console.log(exchangeMapValidation)
          setExchangeMapWindowOpen(true)
        }

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
        if (!res.recordId) toast.success('Record Added Successfully')
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
        if (res.list.length > 0) {
          currenciesGridValidation.setValues({ rows: res.list })
        } else {
          currenciesGridValidation.setValues({
            rows: [
              {
                corId: _recordId,
                currencyId: '',
                currencyRef: '',
                currencyName: '',
                glCurrencyId: '',
                glCurrencyRef: '',
                glCurrencyName: '',
                exchangeId: '',
                exchangeRef: '',
                exchangeName: '',
                outward: false,
                inward: false,
                bankDeposit: false,
                deal: false,
                isInactive: false
              }
            ]
          })
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //EXCHANGE MAP WINDOW
  const exchangeMapValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    initialValues: {
      rows: [
        {
          corId: correspondentValidation.values ? correspondentValidation.values.recordId : '',
          currencyId: '',
          countryId: '',
          countryName: '',
          plantId: '',
          plantRef: '',
          exchangeRef: '',
          exchangeName:'',
          exchangeId: ''
        }
      ]
    },
    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const handleExchangeMapSubmit = () => {
    exchangeMapsGridValidation.handleSubmit()
  }

  const exchangeMapsGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    validate: values => {
      const isValid = values.rows.every(row => !!row.plantId)
      const isValidExchangeId = values.rows.every(row => !!row.exchangeId)

      return (isValid && isValidExchangeId) ? {} : { rows: Array(values.rows.length).fill({ plantId: 'Plant is required' }) }
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
          plantRef: '',
          exchangeId: '',
          exchangeRef: '',
          exchangeName: ''
        }
      ]
    },
    onSubmit: values => {
      // console.log(values + 'value')
      postExchangeMaps(values)
    }
  })

  const exchangeMapsInlineGridColumns = [

    {
      field: 'textfield',
      header: _labels.plant,
      name: 'plantRef',
      mandatory: true,
      readOnly:true

    },
    {
      field: 'textfield',
      header: _labels.name,
      name: 'plantName',
      mandatory: true,
      readOnly:true

    },

    {
      field: 'combobox',
      header: _labels.exchangeTable,
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: true,
      store: exchangeTableStore.list,

      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'exchangeName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    },


    {
      field: 'textfield',
      header: _labels.name,
      name: 'exchangeName',
      mandatory: false,
      readOnly: true
    }


  ]


  const getCurrenciesExchangeMaps = (corId, currencyId, countryId) => {

    // exchangeMapsGridValidation.setValues({rows: []})
    const parameters = '';

    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    }) .then(plants => {

      const defaultParams = `_corId=${corId}&_currencyId=${currencyId}&_countryId=${countryId}`
      const parameters = defaultParams;

        getRequest({
          extension: RemittanceSettingsRepository.CorrespondentExchangeMap.qry,
          parameters: parameters,
        }).then(values => {


            // Create a mapping of commissionId to values entry for efficient lookup
              const valuesMap = values.list.reduce((acc, fee) => {
                // console.log(acc)
                // console.log(fee)
                acc[fee.plantId] = fee;

                return acc;
              }, {});

             // Combine exchangeTable and values
              const rows = plants.list.map(plant => {
                const value = valuesMap[plant.recordId] || 0;

                return {

                  corId: corId,
                  currencyId: currencyId,
                  countryId: countryId,
                  plantId:  plant.recordId,
                  plantName:  plant.name,
                  exchangeId: value.exchangeId,
                  plantRef: plant.reference,
                  exchangeRef: value.exchangeRef ?  value.exchangeRef :'',
                  exchangeName: value.exchangeName

                };
              });

              exchangeMapsGridValidation.setValues({ rows })

          })
          .catch(error => {
            // setErrorMessage(error)
          })

      })
      .catch(error => {
        // setErrorMessage(error)
      })



    //step 3: merge both
  }

  const postExchangeMaps = obj => {
    console.log(obj)

    const data = {
      corId: exchangeMapValidation.values.corId,
      countryId: exchangeMapValidation.values.countryId,
      currencyId: exchangeMapValidation.values.currencyId,
      correspondentExchangeMaps: obj.rows
    }

    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        // getGridData({})
        setExchangeMapWindowOpen(false)
        if (!res.recordId) toast.success('Record Added Successfully')
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
    console.log(correspondentValidation)
    console.log(obj)
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.Correspondent.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})

        setEditMode(true)
        if (!recordId) {
          toast.success('Record Added Successfully')
          if (res.recordId) {
            correspondentValidation.setFieldValue('recordId', res.recordId)
            resetCorrespondentCurrencies(res.recordId)
            resetCorrespondentCountries(res.recordId)
          }
        } else {
          toast.success('Record Editted Successfully')
        }

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

  const resetCorrespondentCountries = (id) => {
    countriesGridValidation.setValues({
      rows: [
        {
          corId: id ? id : correspondentValidation.values
          ? correspondentValidation.values.recordId : "",
          countryId: '',
          countryRef: '',
          countryName: '',
          flName: ''
        }
      ]
    })
  }

  const resetCorrespondentCurrencies = (id) => {
    currenciesGridValidation.setValues({
      rows: [
        {
          corId: id ? id : correspondentValidation.values
          ? correspondentValidation.values.recordId : "",
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
    })
  }

  const resetCorrespondent = () => {
    // correspondentValidation.resetForm({
    //   values: {}
    // })
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

  const fillExchangeTableStore = (id) => {
    setExchangeTableStore({})
    var parameters = `_currencyId=` + id
    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry2,
      parameters: parameters
    })
      .then(res => {
        setExchangeTableStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillExchangeTableStoreAll = () => {
    setExchangeTableStoreAll({})
    var parameters = `_filter=`
    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry,
      parameters: parameters
    })
      .then(res => {
        setExchangeTableStoreAll(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // const fillPlantStore = () => {
  //   var parameters = `_filter=`
  //   getRequest({
  //     extension: SystemRepository.Plant.qry,
  //     parameters: parameters
  //   })
  //     .then(res => {
  //       setPlantStore(res)
  //     })
  //     .catch(error => {
  //       setErrorMessage(error)
  //     })
  // }

  const addCorrespondent = () => {
    resetCorrespondentCountries()
    resetCorrespondentCurrencies()
    resetCorrespondent()
    correspondentValidation.setValues(getNewCorrespondent())

    setActiveTab(0)
    fillCountryStore()
    fillCurrencyStore()

    // fillExchangeTableStore()
    // fillPlantStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const popup = obj => {
    resetCorrespondentCountries(obj.recordId)
    resetCorrespondentCurrencies(obj.recordId)
    resetCorrespondent()
    fillCountryStore()
    fillCurrencyStore()

    fillExchangeTableStoreAll()

    // fillPlantStore()
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
          height={350}
          onSave={handleSubmit}
          editMode={editMode}
          lookupBpMasterData={lookupBpMasterData}
          bpMasterDataStore={bpMasterDataStore}
          setBpMasterDataStore={setBpMasterDataStore}
          correspondentValidation={correspondentValidation}

          //countries tab - inline edit grid

          //countries inline edit grid
          countriesGridValidation={countriesGridValidation}
          countriesInlineGridColumns={countriesInlineGridColumns}

          //currencies tab - inline edit grid

          //currencies inline edit grid
          currenciesGridValidation={currenciesGridValidation}
          currenciesInlineGridColumns={currenciesInlineGridColumns}
          labels={_labels}
          maxAccess={access}
          corId={corId}
        />
      )}

      {exchangeMapWindowOpen && (
        <ExchangeMapWindow
          onClose={() => setExchangeMapWindowOpen(false)}
          onSave={handleExchangeMapSubmit}
          exchangeMapsGridValidation={exchangeMapsGridValidation}
          exchangeMapsInlineGridColumns={exchangeMapsInlineGridColumns}
          exchangeMapValidation={exchangeMapValidation}
          currencyStore={currencyStore.list}
          countryStore={countryStore.list}
          getCurrenciesExchangeMaps={getCurrenciesExchangeMaps}
          maxAccess={access}
          labels={_labels}
          currenciesGridValidation={currenciesGridValidation}
          countriesGridValidation={countriesGridValidation}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Correspondent
