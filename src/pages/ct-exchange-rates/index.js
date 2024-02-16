import React from 'react'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { Grid, Box } from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import FieldSet from 'src/components/Shared/FieldSet'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'

const CTExchangeRates = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //state
  const [errorMessage, setErrorMessage] = useState()
  const [plantStore, setPlantsStore] = useState(null)
  const [rcmStore, setRcmStore] = useState([])
  const { height } = useWindowDimensions()

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.CtExchangeRates
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required('This field is required'),
      puRateTypeId: yup.string().required('This field is required'),
      saRateTypeId: yup.string().required('This field is required')
    }),
    initialValues: {
      currencyId: null,
      puRateTypeId: null,
      saRateTypeId: null
    },
    onSubmit: values => {}
  })

  const exchangeRatesInlineGridColumns = [
    {
      field: 'textfield',
      header: labels.plant,
      nameId: 'plantId',
      name: 'plantName',
      mandatory: true,
      readOnly: true
    },
    {
      field: 'combobox',
      valueField: 'key',
      displayField: 'value',
      header: labels.rcm,
      nameId: 'rateCalcMethod',
      name: 'rateCalcMethodName',
      store: rcmStore,
      mandatory: true,
      widthDropDown: '150',
      columnsInDropDown: [{ key: 'value', value: 'rateCalcMethodName' }]
    },
    {
      field: 'textfield',
      header: labels.min,
      nameId: 'minRate',
      name: 'minRate',
      mandatory: true
    },
    {
      field: 'textfield',
      header: labels.rate,
      nameId: 'rate',
      name: 'rate',
      mandatory: true
    },
    {
      field: 'textfield',
      header: labels.max,
      nameId: 'maxRate',
      name: 'maxRate',
      mandatory: true
    }
  ]

  //purchase grid
  const puFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValidMin = values.rows && values.rows.every(row => !!row.maxRate)
      const isValidMax = values.rows && values.rows.every(row => !!row.minRate)
      const isValidRate = values.rows && values.rows.every(row => !!row.rate)

      return isValidMin && isValidMax & isValidRate
        ? {}
        : {
            rows: Array(values.rows && values.rows.length).fill({
              minRate: 'Min Rate is required',
              maxRate: 'Max rate is required',
              rate: 'Rate is required'
            })
          }
    },
    onSubmit: values => {
      postExchangeMaps(values, formik.values.currencyId, formik.values.puRateTypeId)
    }
  })

  //sales grid
  const saFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValidMin = values.rows && values.rows.every(row => !!row.maxRate)
      const isValidMax = values.rows && values.rows.every(row => !!row.minRate)
      const isValidRate = values.rows && values.rows.every(row => !!row.rate)

      return isValidMin && isValidMax & isValidRate
        ? {}
        : {
            rows: Array(values.rows && values.rows.length).fill({
              minRate: 'Min Rate is required',
              maxRate: 'Max rate is required',
              rate: 'Rate is required'
            })
          }
    },
    onSubmit: values => {
      postExchangeMaps(values, formik.values.currencyId, formik.values.saRateTypeId)
    }
  })

  const postExchangeMaps = (obj, currencyId, rateTypeId) => {
    const data = {
      currencyId: currencyId,
      rateTypeId: rateTypeId,
      exchangeMaps: obj.rows
    }

    postRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Saved Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (formik.values) {
      if (formik.values.currencyId != null && formik.values.puRateTypeId != null) {
        getExchangeRates(formik.values.currencyId, formik.values.puRateTypeId, puFormik)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.currencyId, formik.values.puRateTypeId])

  useEffect(() => {
    if (formik.values) {
      if (formik.values.currencyId != null && formik.values.saRateTypeId != null) {
        getExchangeRates(formik.values.currencyId, formik.values.saRateTypeId, saFormik)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.currencyId, formik.values.saRateTypeId])

  useEffect(() => {
    getAllPlants()
    fillRcmStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getAllPlants = () => {
    const parameters = ''
    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    }).then(plants => {
      setPlantsStore(plants.list)
    })
  }

  const getExchangeRates = (cuId, rateTypeId, formik) => {
    formik.setValues({ rows: [] })
    if (cuId && rateTypeId) {
      const parameters = `_currencyId=${cuId}&_rateTypeId=${rateTypeId}`
      getRequest({
        extension: CurrencyTradingSettingsRepository.ExchangeMap.qry,
        parameters: parameters
      })
        .then(values => {
          //step 1: display all plants

          // Create a mapping of commissionId to values entry for efficient lookup
          const valuesMap = values.list.reduce((acc, fee) => {
            acc[fee.plantId] = fee

            return acc
          }, {})

          // Combine exchangeTable and values
          const rows = plantStore.map(plant => {
            const value = valuesMap[plant.recordId] || 0

            return {
              currencyId: cuId,
              rateTypeId: rateTypeId,
              plantId: plant.recordId,
              plantName: plant.name,
              rateCalcMethod: value.rateCalcMethod,
              rateCalcMethodName: value.rateCalcMethodName,
              rate: value.rate,
              minRate: value.minRate,
              maxRate: value.maxRate
            }
          })

          formik.setValues({ rows })
        })

        //   // Create a set to store unique exchangeIds
        //   const uniqueExchangeIds = new Set()

        //   // Filtered list to store dictionaries with distinct exchangeIds
        //   const filteredList = []

        //   // Iterate through each dictionary in the original list
        //   values?.list.forEach(exchange => {
        //     const exchangeId = exchange.exchangeId

        //     // Check if the exchangeId is not in the set (not seen before)
        //     if (!uniqueExchangeIds.has(exchangeId)) {
        //       // Add the exchangeId to the set to mark it as seen
        //       uniqueExchangeIds.add(exchangeId)

        //       // Add the dictionary to the filtered list
        //       filteredList.push({
        //         exchangeId: exchange.exchange?.recordId ? exchange.exchange.recordId : '',
        //         exchangeRef: exchange.exchange?.reference ? exchange.exchange.reference : '',
        //         exchangeName: exchange.exchange?.name ? exchange.exchange.name : '',
        //         rateCalcMethodName: exchange.exchange?.rateCalcMethodName ? exchange.exchange.rateCalcMethodName : '',
        //         rate: exchange.exchangeRate?.rate ? exchange.exchangeRate.rate : '',
        //         minRate: exchange.exchangeRate?.minRate ? exchange.exchangeRate.minRate : '',
        //         maxRate: exchange.exchangeRate?.maxRate ? exchange.exchangeRate.maxRate : ''
        //       })
        //     }
        //   })

        //   const rows = filteredList

        //   formik.setValues({ rows })
        // })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  const fillRcmStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.MC_RATE_CALC_METHOD,
      callback: setRcmStore
    })
  }

  const handleSubmit = () => {
    if (formik.values.currencyId != null && formik.values.puRateTypeId != null) puFormik.handleSubmit()
    if (formik.values.currencyId != null && formik.values.saRateTypeId != null) saFormik.handleSubmit()
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
                  endpointId={SystemRepository.Currency.qry}
                  name='currencyId'
                  label={labels.currency}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  required
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik && formik.setFieldValue('currencyId', newValue?.recordId)
                  }}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  helperText={formik.touched.currencyId && formik.errors.currencyId}
                />
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={6}>
                <FieldSet>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={MultiCurrencyRepository.RateType.qry}
                      name='puRateTypeId'
                      label={labels.rateType}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Ref' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      required
                      maxAccess={access}
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('puRateTypeId', newValue?.recordId)
                      }}
                      error={formik.touched.puRateTypeId && Boolean(formik.errors.puRateTypeId)}
                      helperText={formik.touched.puRateTypeId && formik.errors.puRateTypeId}
                    />
                  </Grid>
                  {formik.values.currencyId != null && formik.values.puRateTypeId != null && (
                    <Grid xs={12} sx={{ pt: 2 }}>
                      <Box>
                        <InlineEditGrid
                          gridValidation={puFormik}
                          columns={exchangeRatesInlineGridColumns}
                          allowDelete={false}
                          allowAddNewLine={false}
                          width={'1200'}
                          scrollable={true}
                          scrollHeight={`${height - 300}px`}
                        />
                      </Box>
                    </Grid>
                  )}
                </FieldSet>
              </Grid>
              <Grid item xs={6}>
                <FieldSet>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={MultiCurrencyRepository.RateType.qry}
                      name='saRateTypeId'
                      label={labels.rateType}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Ref' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      required
                      maxAccess={access}
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('saRateTypeId', newValue?.recordId)
                      }}
                      error={formik.touched.saRateTypeId && Boolean(formik.errors.saRateTypeId)}
                      helperText={formik.touched.saRateTypeId && formik.errors.saRateTypeId}
                    />
                  </Grid>
                  {formik.values.currencyId != null && formik.values.saRateTypeId != null && (
                    <Grid xs={12} sx={{ pt: 2 }}>
                      <Box>
                        <InlineEditGrid
                          gridValidation={saFormik}
                          columns={exchangeRatesInlineGridColumns}
                          allowDelete={false}
                          allowAddNewLine={false}
                          width={'1200'}
                          scrollable={true}
                          scrollHeight={`${height - 300}px`}
                        />
                      </Box>
                    </Grid>
                  )}
                </FieldSet>
              </Grid>
            </Grid>
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
          <WindowToolbar onSave={handleSubmit} smallBox={true} />
        </Grid>
      </CustomTabPanel>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </Box>
  )
}

export default CTExchangeRates
