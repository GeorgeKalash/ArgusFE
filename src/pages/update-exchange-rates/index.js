import React from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { Grid, Box } from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { DataGrid } from 'src/components/Shared/DataGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

const UpdateExchangeRates = () => {
  const [access, setAccess] = useState()
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { getLabels, getAccess } = useContext(ControlContext)
  const [labels, setLabels] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const { width, height } = useWindowDimensions()

  const _labels = {
    country: labels && labels.find(item => item.key === '1') && labels.find(item => item.key === '2').value,
    currency: labels && labels.find(item => item.key === '2') && labels.find(item => item.key === '1').value,
    exchangeTable: labels && labels.find(item => item.key === '3') && labels.find(item => item.key === '3').value,
    RCM: labels && labels.find(item => item.key === '4') && labels.find(item => item.key === '4').value,
    rates: labels && labels.find(item => item.key === '6') && labels.find(item => item.key === '6').value,
    sellMin: labels && labels.find(item => item.key === '5') && labels.find(item => item.key === '5').value,
    sellMax: labels && labels.find(item => item.key === '7') && labels.find(item => item.key === '7').value,
    exchangeBuy: labels && labels.find(item => item.key === '10') && labels.find(item => item.key === '10').value,
    against: labels && labels.find(item => item.key === '9') && labels.find(item => item.key === '9').value,
    rate: labels && labels.find(item => item.key === '8') && labels.find(item => item.key === '8').value
  }

  const columns = [
    {
      component: 'textfield',
      label: _labels.exchangeTable,
      name: 'exchangeRef',
      props: {
        readOnly: true
      }
    },

    {
      component: 'textfield',
      label: _labels.exchangeTable,
      name: 'exchangeName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: _labels.RCM,
      name: 'rateCalcMethodName',
      props: {
        readOnly: true
      }
    },

    {
      component: 'textfield',
      label: _labels.sellMin,
      name: 'minRate'
    },
    {
      component: 'textfield',
      header: _labels.rates,
      name: 'rate'
    },
    {
      component: 'textfield',
      header: _labels.sellMax,
      name: 'maxRate'
    }
  ]

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      currencyId: '',
      countryId: '',
      exchangeId: '',
      exchangeRef: '',
      exchangeName: '',
      rateCalcMethodName: '',
      rateAgainstName: '',
      rateAgainstCurrencyRef: '',
      rate: '',
      rows: [
        {
          id: 1,
          currencyId: '',
          countryId: '',
          rateCalcMethodName: '',
          exchangeId: '',
          minRate: '',
          Rate: '',
          maxRate: ''
        }
      ]
    },
    validationSchema: yup.object({
      rows: yup
        .array()
        .of(
          yup.object().shape({
            exchangeRef: yup.string().required(''),

            maxRate: yup.string().required(''),
            minRate: yup.string().required(''),
            rate: yup.string().required('')
          })
        )
        .required('Operations array is required')
    }),

    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const postExchangeMaps = obj => {
    const data = {
      items: obj.rows
    }
    postRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeRates.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Successfully')
      })
      .catch()
  }

  useEffect(() => {
    if (!access) {
      getAccess(ResourceIds.updateExchangerRates, setAccess)
    } else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.updateExchangerRates, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const getExchangeRates = (cuId, coId) => {
    formik.setFieldValue('rows', [
      { id: 1, currencyId: '', countryId: '', rateCalcMethod: '', exchangeId: '', minRate: '', Rate: '', maxRate: '' }
    ])
    if (cuId && coId) {
      const defaultParams = `_currencyId=${cuId}&_countryId=${coId}`
      const parameters = defaultParams
      cuId &&
        coId &&
        getRequest({
          extension: RemittanceSettingsRepository.ExchangeRates.qry,
          parameters: parameters
        })
          .then(exchangeTable => {
            var parameters = ''
            getRequest({
              extension: CurrencyTradingSettingsRepository.ExchangeRates.qry,
              parameters: parameters
            })
              .then(values => {
                const valuesMap = values.list.reduce((acc, fee) => {
                  acc[fee.exchangeId] = fee

                  return acc
                }, {})

                const rows = exchangeTable.list.map((exchange, index) => {
                  const value = valuesMap[exchange.exchangeId] || 0

                  return {
                    id: index + 1,
                    exchangeId: exchange.exchangeId,
                    exchangeRef: exchange.exchangeRef,
                    exchangeName: exchange.exchangeName,
                    rateCalcMethod: exchange.rateCalcMethod,
                    rateCalcMethodName: exchange.rateCalcMethodName,
                    rate: value?.rate ? value.rate : '',
                    minRate: value.minRate ? value.minRate : '',
                    maxRate: value.maxRate ? value.maxRate : ''
                  }
                })
                formik.setFieldValue('rows', rows)
              })
              .catch()
          })
          .catch()
    }
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const fillExchangeTableStore = (currencyId, countryId) => {
    formik.setFieldValue('rateAgainstName', '')
    formik.setFieldValue('rateAgainstCurrencyRef', '')
    formik.setFieldValue('rateCalcMethodName', '')
    formik.setFieldValue('rate', '')
    formik.setFieldValue('exchangeRef', '')
    formik.setFieldValue('exchangeId', '')
    const defaultParams = `_currencyId=${currencyId}&_countryId=${countryId}`

    var parameters = defaultParams
    if (currencyId && countryId)
      getRequest({
        extension: RemittanceSettingsRepository.ExchangeRates.get,
        parameters: parameters
      })
        .then(res => {
          if (res?.record?.exchangeId) {
            formik.setFieldValue('exchangeRef', res.record?.exchangeRef)
            formik.setFieldValue('exchangeId', res.record?.exchangeId)

            const defaultParams = `_recordId=${res.record.exchangeId}`
            var parameters = defaultParams
            getRequest({
              extension: MultiCurrencyRepository.ExchangeTable.get,
              parameters: parameters
            })
              .then(res => {
                formik.setFieldValue('rateAgainstName', res.record.rateAgainstName)
                formik.setFieldValue('rateAgainstCurrencyRef', res.record.rateAgainstCurrencyRef)
                formik.setFieldValue('rateCalcMethodName', res.record.rateCalcMethodName)
              })
              .catch()

            const dParams = `_exchangeId=${res?.record?.exchangeId}`
            var parameters = dParams
            getRequest({
              extension: CurrencyTradingSettingsRepository.ExchangeRates.get,
              parameters: parameters
            })
              .then(res => {
                formik.setFieldValue('rate', res.record?.rate)
              })
              .catch()
          }
        })
        .catch()
  }

  return (
    <Box
      sx={{
        height: `${height - 80}px`
      }}
    >
      <CustomTabPanel index={0} value={0}>
        <Box>
          <Grid container>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SystemRepository.Country.qry}
                  name='countryId'
                  label={_labels.country}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name', 'flName']}
                  required
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    const selectedCountryId = newValue?.recordId || ''
                    formik.setFieldValue('countryId', selectedCountryId)
                    fillExchangeTableStore(formik.values.currencyId, selectedCountryId)
                    getExchangeRates(formik.values.currencyId, selectedCountryId)
                  }}
                  error={formik.errors && Boolean(formik.errors.countryId)}
                  helperText={formik.touched.countryId && formik.errors.countryId}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name='exchange'
                  label={_labels.exchangeBuy}
                  value={formik.values.exchangeRef}
                  readOnly='true'
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SystemRepository.Currency.qry}
                  name='currencyId'
                  label={_labels.currency}
                  valueField='recordId'
                  displayField='name'
                  columnsInDropDown={[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  required
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    const selectedCurrencyId = newValue?.recordId || ''
                    formik.setFieldValue('currencyId', selectedCurrencyId)
                    getExchangeRates(selectedCurrencyId, formik.values.countryId)
                    fillExchangeTableStore(selectedCurrencyId, formik.values.countryId)
                  }}
                  error={formik.errors && Boolean(formik.errors.currencyId)}
                  helperText={formik.touched.currencyId && formik.errors.currencyId}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name='against'
                  label={_labels.against}
                  value={formik.values.rateAgainstName}
                  readOnly='true'
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name='crm'
                  label={_labels.RCM}
                  value={formik.values.rateCalcMethodName}
                  readOnly='true'
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name='rate'
                  label={_labels.rate}
                  value={formik.values.rate}
                  readOnly='true'
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
            {formik.values.currencyId > 0 && formik.values.countryId > 0 && (
              <Grid xs={12} sx={{ pt: 2 }}>
                <Box>
                  <DataGrid
                    onChange={value => formik.setFieldValue('rows', value)}
                    value={formik.values.rows}
                    error={formik.errors.rows}
                    columns={columns}
                    height={`calc(100vh - 320px)`}
                    allowDelete={false}
                    allowAddNewLine={false}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        <Grid
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: 0,
            textAlign: 'center'
          }}
        >
          <WindowToolbar onSave={handleSubmit} isSaved={true} smallBox={true} />
        </Grid>
      </CustomTabPanel>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </Box>
  )
}

export default UpdateExchangeRates
