// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox, DialogActions } from '@mui/material'

// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'

const CurrencyExchangeMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //state
  const [currencyStore, setCurrencyStore] = useState([])
  const [exchangeTableStore, setExchangeTableStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [errorMessage, setErrorMessage] = useState()
  const [currencyId, setCurrencyId] = useState(0)
  const [access, setAccess] = useState(0)
  const [labels, setLabels] = useState(null)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.currencyExchangeMap, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.currencyExchangeMap, setLabels)
        fillCurrencyStore()
        fillCountryStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
      })
      .catch(error => {})
  }

  const fillCountryStore = () => {
    var parameters = `_filter=`
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


  const fillExchangeTableStore = (id) => {
    setExchangeTableStore({})

    var parameters = `_currencyId=` + id
    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry2,
      parameters: parameters
    })
      .then(res => {
        console.log(res)
        setExchangeTableStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const exchangeMapsValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required')
    }),
    initialValues: {
      currencyId: '',
      countryId: ''
    },
    onSubmit: values => {}
  })

  useEffect(() => {
    if (
      exchangeMapsValidation.values &&
      exchangeMapsValidation.values.currencyId > 0

    ) {
      fillExchangeTableStore(exchangeMapsValidation.values.currencyId)
    }
  }, [exchangeMapsValidation.values.currencyId])
  useEffect(() => {
    if (
      exchangeMapsValidation.values &&
      exchangeMapsValidation.values.currencyId > 0 &&
      exchangeMapsValidation.values.countryId > 0
    ) {
      getCurrenciesExchangeMaps(exchangeMapsValidation.values.currencyId, exchangeMapsValidation.values.countryId)
    }
  }, [exchangeMapsValidation.values])

  const exchangeMapsGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows && values.rows.every(row => !!row.plantId)
      const isValidExchangeId = values.rows && values.rows.every(row => !!row.exchangeId)

      return isValid // prevent Submit if not validate
        ? isValidExchangeId
          ? {}
          : { rows: Array(values.rows && values.rows.length).fill({ plantId: 'Exchange is required' }) }
        : { rows: Array(values.rows && values.rows.length).fill({ countryId: 'plant is required' }) }
    },
    initialValues: {
      rows: [
        {
          currencyId: exchangeMapsValidation.values.currencyId,
          countryId: exchangeMapsValidation.values.countryId,
          plantId: '',
          countryName: '',
          plantName: '',
          exchangeRef: '',
          exchangeId: '',
          exchangeName: ''
        }
      ]
    },
    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const _labels = {
    country: labels && labels.find(item => item.key === 1) && labels.find(item => item.key === 1).value,
    currency: labels && labels.find(item => item.key === 2) && labels.find(item => item.key === 2).value,
    exchangeTable: labels && labels.find(item => item.key === 3) && labels.find(item => item.key === 3).value,
    plant: labels && labels.find(item => item.key === 4) && labels.find(item => item.key === 4).value,
    name: labels && labels.find(item => item.key === 5) && labels.find(item => item.key === 5).value

  }

  const postExchangeMaps = obj => {
    const data = {
      currencyId: exchangeMapsValidation.values.currencyId,
      countryId: exchangeMapsValidation.values.countryId,
      globalExchangeMaps: obj.rows
    }
    postRequest({
      extension: RemittanceSettingsRepository.CurrencyExchangeMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res.statusId) toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }




  const getCurrenciesExchangeMaps = ( currencyId, countryId) => {

    exchangeMapsGridValidation.setValues({rows: []})
    const parameters = '';

    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    }) .then(plants => {


      const defaultParams = `_currencyId=${currencyId}&_countryId=${countryId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.CurrencyExchangeMap.qry,
      parameters: parameters
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

                  currencyId: currencyId,
                  countryId: countryId,
                  plantId:  plant.recordId,
                  plantName:  plant.name,
                  exchangeId: value.exchangeId ? value.exchangeId : '',
                  plantRef:  plant.reference,
                  exchangeRef: value.exchangeRef ? value.exchangeRef : '',
                  exchangeName: value.exchangeName ? value.exchangeName : ''
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


  //columns
  const exchangeMapsInlineGridColumns = [
    {
      field: 'textfield',
      header: _labels.plant, //label
      name: 'plantRef',
      mandatory: true,
      readOnly: true,


    },
    {
      field: 'textfield',
      header: _labels.name, //label
      name: 'plantName',
      mandatory: true,
      readOnly: true,


    },

    {
      field: 'combobox',
      header: _labels.exchangeTable,
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: true,
      store: exchangeTableStore.list,
      width: '500px',
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

  const handleSubmit = () => {
    exchangeMapsGridValidation.handleSubmit()
  }

  return (
    <Box>
      <CustomTabPanel index={0} value={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Grid container>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={6}>
                <CustomComboBox
                  name='countryId'
                  label={_labels.country}
                  valueField='recordId'
                  displayField= {['reference', 'name']}
                  columnsInDropDown= {[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  store={countryStore}
                  value={
                    countryStore?.filter(
                      item =>
                        item.recordId === (exchangeMapsValidation.values && exchangeMapsValidation.values.countryId)
                    )[0]
                  } // Ensure the value matches an option or set it to null
                  required
                  onChange={(event, newValue) => {
                    const selectedCurrencyId = newValue?.recordId || ''
                    exchangeMapsValidation.setFieldValue('countryId', selectedCurrencyId)

                    // Fetch and update state data based on the selected country
                  }}
                  error={exchangeMapsValidation.errors && Boolean(exchangeMapsValidation.errors.countryId)}
                  helperText={exchangeMapsValidation.touched.countryId && exchangeMapsValidation.errors.countryId}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomComboBox
                  name='currencyId'
                  label={_labels.currency}
                  valueField='recordId'

                  // displayField='name'

                  displayField= {['reference', 'name']}
                  columnsInDropDown= {[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' },
                  ]}
                  store={currencyStore}
                  value={
                    currencyStore.filter(
                      item =>
                        item.recordId === (exchangeMapsValidation.values && exchangeMapsValidation.values.currencyId)
                    )[0]
                  } // Ensure the value matches an option or set it to null
                  required
                  onChange={(event, newValue) => {
                    exchangeMapsValidation.setFieldValue('currencyId', newValue?.recordId)

                    // Fetch and update state data based on the selected country
                  }}
                  error={exchangeMapsValidation.errors && Boolean(exchangeMapsValidation.errors.currencyId)}
                  helperText={exchangeMapsValidation.touched.currencyId && exchangeMapsValidation.errors.currencyId}
                />
              </Grid>
            </Grid>
            {exchangeMapsValidation.values.currencyId > 0 && exchangeMapsValidation.values.countryId > 0 && (
              <Grid xs={12}>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <InlineEditGrid
                    gridValidation={exchangeMapsGridValidation}
                    columns={exchangeMapsInlineGridColumns}
                    defaultRow={{
                      currencyId: exchangeMapsValidation.values.currencyId
                        ? exchangeMapsValidation.values.currencyId
                        : '',
                      countryId: exchangeMapsValidation.values.countryId ? exchangeMapsValidation.values.countryId : '',
                      exchangeId: exchangeMapsGridValidation.values.exchangeId
                        ? exchangeMapsGridValidation.values.exchangeId
                        : '',
                      plantId: exchangeMapsGridValidation.values.plantId
                        ? exchangeMapsGridValidation.values.plantId
                        : '',
                      countryName: '',
                      exchangeRef: '',
                      exchangeName: ''
                    }}
                    allowDelete={false}
                    allowAddNewLine={false}
                    width={'1200'}
                    scrollable={true}
                    scrollHeight={560}
                  />
                </Box>
                <WindowToolbar onSave={handleSubmit} />
              </Grid>
            )}
          </Grid>
        </Box>
      </CustomTabPanel>
      <WindowToolbar />
    </Box>
  )
}

export default CurrencyExchangeMap
