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

const GlobalExchangeBuyMap = () => {
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
    if (!access) getAccess(ResourceIds.CorrespondentAgentBranch, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        var parameters = `_filter=`
        getRequest({
          extension: SystemRepository.Currency.qry,
          parameters: parameters
        })
          .then(res => {
            setCurrencyStore(res.list)
          })
          .catch(error => {})

          console.log(window.innerHeight)
        fillCountryStore()

        // fillExchangeTableStore()
        getLabels(ResourceIds.GlobalExchangeBuyMap, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

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

  const exchangeMapsGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows && values.rows.every(row => !!row.countryId)
      const isValidExchangeId = values.rows && values.rows.every(row => !!row.exchangeId)

      return isValid // prevent Submit if not validate
        ? isValidExchangeId
          ? {}
          : { rows: Array(values.rows && values.rows.length).fill({ exchangeId: 'Exchange is required' }) }
        : { rows: Array(values.rows && values.rows.length).fill({ countryId: 'country is required' }) }
    },
    initialValues: {
      rows: [
        {
          currencyId: currencyId,
          countryId: '',
          countryName: '',
          countryRef: '',
          exchangeRef: '', // validate red
          exchangeName: '', // validate red
          exchangeId: ''
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
    name: labels && labels.find(item => item.key === 4) && labels.find(item => item.key === 4).value

  }

  const postExchangeMaps = obj => {
    const data = {
      currencyId: currencyId,
      globalExchangeBuyMaps: obj.rows
    }
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeBuyMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res.statusId) toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getCurrenciesExchangeMaps = (currencyId) => {
    fillExchangeTableStore(currencyId)
    exchangeMapsGridValidation.setValues({
      rows: [
        {
          currencyId: '',
          countryId: '',
          countryName: '',
          countryRef: '',
          exchangeRef: '', // validate red
          exchangeName: '', // validate red
          exchangeId: ''
        }
      ]
    })
    const defaultParams = `_currencyId=${currencyId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeBuyMap.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) {
          exchangeMapsGridValidation.setValues({ rows: res.list })
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //columns
  const exchangeMapsInlineGridColumns = [
    {
      field: 'combobox',
      header: _labels.country, //label
      nameId: 'countryId',
      name: 'countryRef',
      mandatory: true,
      store: countryStore.list,

      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'countryName' }],

      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'textfield',
      header: _labels.name,
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },

    {
      field: 'combobox',
      header: _labels.exchangeTable,
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: true,

      store: exchangeTableStore.list ,
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
                  name='currencyId'
                  label={_labels.currency}
                  valueField='recordId'
                  displayField= {['reference', 'name']}
                  columnsInDropDown= {[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' },
                  ]}
                  store={currencyStore}
                  value={
                    currencyStore.filter(item => item.recordId === exchangeMapsGridValidation.values.currencyId)[0]
                  } // Ensure the value matches an option or set it to null
                  required
                  onChange={(event, newValue) => {
                    exchangeMapsGridValidation.setFieldValue('currencyId', newValue?.recordId)
                    const selectedCurrencyId = newValue?.recordId || ''
                    getCurrenciesExchangeMaps(selectedCurrencyId)
                    setCurrencyId(selectedCurrencyId)
                    exchangeMapsGridValidation.setFieldValue('currencyId', selectedCurrencyId)

                    // Fetch and update state data based on the selected country
                  }}
                  error={exchangeMapsGridValidation.errors && Boolean(exchangeMapsGridValidation.errors.currencyId)}
                  helperText={
                    exchangeMapsGridValidation.touched.currencyId && exchangeMapsGridValidation.errors.currencyId
                  }
                />
              </Grid>
            </Grid>
            {currencyId > 0 && (

              <Grid xs={12} spacing={5}>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' ,marginRight:'5px'}}>
                  <InlineEditGrid
                    gridValidation={exchangeMapsGridValidation}
                    columns={exchangeMapsInlineGridColumns}
                    defaultRow={{
                      currencyId: currencyId ? currencyId : '',
                      countryId: exchangeMapsGridValidation.values.countryId
                        ? exchangeMapsGridValidation.values.countryId
                        : '',
                      exchangeId: exchangeMapsGridValidation.values.exchangeId
                        ? exchangeMapsGridValidation.values.exchangeId
                        : '',
                      countryName: '',
                      exchangeRef: ''
                    }}
                    width={'1200'}
                    scrollable={true}
                    scrollHeight={'70vh'}
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

export default GlobalExchangeBuyMap
