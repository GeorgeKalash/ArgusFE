import React from 'react'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { Grid, Box, Button } from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
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
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'

const CTExchangeRates = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { platformLabels } = useContext(ControlContext)

  //state
  const [errorMessage, setErrorMessage] = useState()
  const [plantStore, setPlantsStore] = useState(null)
  const { height } = useWindowDimensions()

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.CtExchangeRates
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required('This field is required'),
      rateAgainst: yup.string().required('This field is required'),
      raCurrencyId: yup.string().required('This field is required'),
      puRateTypeId: yup.string().required('This field is required'),
      saRateTypeId: yup.string().required('This field is required')
    }),
    initialValues: {
      currencyId: null,
      rateAgainst: null,
      raCurrencyId: null,
      puRateTypeId: null,
      saRateTypeId: null
    },
    onSubmit: values => {}
  })

  const exchangeRatesInlineGridColumns = [
    {
      component: 'textfield',
      label: labels.plant,
      name: 'plantName'
    },
    {
      component: 'resourcecombobox',
      label: labels.rcm,
      name: 'rateCalcMethodName',
      props: {
        datasetId: DataSets.MC_RATE_CALC_METHOD,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'key', to: 'rateCalcMethod' },
          { from: 'value', to: 'rateCalcMethodName' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.min,
      name: 'minRate'
    },
    {
      component: 'textfield',
      label: labels.rate,
      name: 'rate'
    },
    {
      component: 'textfield',
      label: labels.max,
      name: 'maxRate'
    }
  ]

  //purchase grid
  const puFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup
        .array()
        .of(
          yup.object().shape({
            minRate: yup.string().required('minRate is required'),
            maxRate: yup.string().required('maxRate is required'),
            rate: yup.string().required('rate is required'),
            rateCalcMethodName: yup.string().required('rateCalcMethod is required')

            // rateCalcMethod: yup.string().required('rateCalcMethod is required')
          })
        )
        .required('rows array is required')
    }),
    initialValues: {
      rows: [
        {
          id: 1,
          currencyId: null,
          raCurrencyId: null,
          rateTypeId: null,
          plantId: null,
          plantName: '',
          rateCalcMethod: null,
          rateCalcMethodName: '',
          minRate: null,
          maxRate: null,
          rate: null
        }
      ]
    },
    onSubmit: values => {
      postExchangeMaps(values, formik.values.currencyId, formik.values.raCurrencyId, formik.values.puRateTypeId)
    }
  })

  //sales grid
  const saFormik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup
        .array()
        .of(
          yup.object().shape({
            minRate: yup.string().required('minRate is required'),
            maxRate: yup.string().required('maxRate is required'),
            rate: yup.string().required('rate is required'),
            rateCalcMethodName: yup.string().required('rateCalcMethod is required')
          })
        )
        .required('rows array is required')
    }),
    initialValues: {
      rows: [
        {
          id: 1,
          currencyId: null,
          raCurrencyId: null,
          rateTypeId: null,
          plantId: null,
          plantName: '',
          rateCalcMethod: null,
          rateCalcMethodName: '',
          minRate: null,
          maxRate: null,
          rate: null
        }
      ]
    },
    onSubmit: values => {
      postExchangeMaps(values, formik.values.currencyId, formik.values.raCurrencyId, formik.values.saRateTypeId)
    }
  })

  const postExchangeMaps = (obj, currencyId, raCurrencyId, rateTypeId) => {
    const data = {
      currencyId: currencyId,
      rateTypeId: rateTypeId,
      raCurrencyId: raCurrencyId,
      exchangeMaps: obj.rows
    }

    postRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success(platformLabels.Saved)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (formik.values) {
      if (formik.values.currencyId != null && formik.values.puRateTypeId != null) {
        getExchangeRates(formik.values.currencyId, formik.values.puRateTypeId, formik.values.raCurrencyId, puFormik)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.currencyId, formik.values.raCurrencyId, formik.values.puRateTypeId])

  useEffect(() => {
    if (formik.values) {
      if (formik.values.currencyId != null && formik.values.saRateTypeId != null) {
        getExchangeRates(formik.values.currencyId, formik.values.saRateTypeId, formik.values.raCurrencyId, saFormik)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.currencyId, formik.values.raCurrencyId, formik.values.saRateTypeId])

  useEffect(() => {
    getAllPlants()
    formik.setFieldValue('rateAgainst', '1')
    getDefaultBaseCurrencyId()
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

  const getExchangeRates = (cuId, rateTypeId, raCurrencyId, formik) => {
    formik.setFieldValue('rows', [])
    if (cuId && rateTypeId) {
      const parameters = `_currencyId=${cuId}&_rateTypeId=${rateTypeId}&_raCurrencyId=${raCurrencyId}`
      getRequest({
        extension: CurrencyTradingSettingsRepository.ExchangeMap.qry,
        parameters: parameters
      })
        .then(values => {
          //step 1: display all plants

          // Create a mapping of plantId to values entry for efficient lookup
          const valuesMap = values.list.reduce((acc, fee) => {
            acc[fee.plantId] = fee

            return acc
          }, {})

          // Combine exchangeTable and values
          const rows = plantStore.map((plant, index) => {
            const value = valuesMap[plant.recordId] || 0

            return {
              id: index,
              currencyId: cuId,
              raCurrencyId: raCurrencyId,
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

          formik.setValues({
            ...formik.values,
            rows: rows
          })
        })

        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  const getDefaultBaseCurrencyId = () => {
    var parameters = `_key=baseCurrencyId`
    getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: parameters
    })
      .then(res => {
        formik.setFieldValue('raCurrencyId', parseInt(res?.record?.value))
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    if (formik.values.currencyId != null && formik.values.puRateTypeId != null) puFormik.handleSubmit()
    if (formik.values.currencyId != null && formik.values.saRateTypeId != null) saFormik.handleSubmit()
  }

  const copyRowValues = formik => {
    const firstRow = formik.values.rows[0]

    const rows = formik.values.rows.map(row => {
      return {
        ...row,
        minRate: firstRow.minRate,
        maxRate: firstRow.maxRate,
        rate: firstRow.rate,
        rateCalcMethod: firstRow.rateCalcMethod,
        rateCalcMethodName: firstRow.rateCalcMethodName
      }
    })

    formik.setValues({
      ...formik.values,
      rows: rows
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container xs={12} sx={{ flexDirection: 'column', padding: '5px' }}>
          <VertLayout>
            <Fixed>
              <Grid item xs={12} sx={{ flexDirection: 'column' }}>
                <Grid container spacing={2}>
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
                  <Grid item xs={3}>
                    <ResourceComboBox
                      name='rateAgainst'
                      label={labels.rateAgainst}
                      datasetId={DataSets.MC_RATE_AGAINST}
                      values={formik.values}
                      valueField='key'
                      displayField='value'
                      required
                      onChange={(event, newValue) => {
                        formik.setFieldValue('rateAgainst', newValue?.key)
                        if (!newValue) {
                          formik.setFieldValue('raCurrencyId', null)
                        } else {
                          if (newValue.key === '1') getDefaultBaseCurrencyId()
                        }
                      }}
                      error={formik.touched.rateAgainst && Boolean(formik.errors.rateAgainst)}
                      helperText={formik.touched.rateAgainst && formik.errors.rateAgainst}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      endpointId={SystemRepository.Currency.qry}
                      name='raCurrencyId'
                      label={labels.currency}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Currency Ref' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      required
                      readOnly={!formik.values.rateAgainst || formik.values.rateAgainst === '1' ? true : false}
                      maxAccess={access}
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('raCurrencyId', newValue?.recordId)
                      }}
                      error={formik.touched.raCurrencyId && Boolean(formik.errors.raCurrencyId)}
                      helperText={formik.touched.raCurrencyId && formik.errors.raCurrencyId}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Fixed>
            <Grow>
              <Grid container sx={{ flex: 1 }}>
                <Grid item xs={6} sx={{ display: 'flex', flex: 1 }}>
                  <FieldSet sx={{ flex: 1 }}>
                    <VertLayout>
                      <Fixed>
                        <Grid container xs={12} spacing={2}>
                          <Grid item xs={9}>
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
                          <Grid item xs={3}>
                            <Button
                              onClick={() => copyRowValues(puFormik)}
                              variant='contained'
                              disabled={
                                !puFormik?.values?.rows ||
                                !formik.values.puRateTypeId ||
                                !puFormik?.values?.rows[0]?.rateCalcMethod ||
                                !puFormik?.values?.rows[0]?.rate ||
                                !puFormik?.values?.rows[0]?.minRate ||
                                !puFormik?.values?.rows[0]?.maxRate
                              }
                            >
                              Copy
                            </Button>
                          </Grid>
                        </Grid>
                      </Fixed>
                      <Grow>
                        {formik.values.currencyId != null && formik.values.puRateTypeId != null && (
                          <DataGrid
                            onChange={value => puFormik.setFieldValue('rows', value)}
                            value={puFormik.values.rows}
                            error={puFormik.errors.rows}
                            columns={exchangeRatesInlineGridColumns}
                            allowDelete={false}
                            allowAddNewLine={false}
                          />
                        )}
                      </Grow>
                    </VertLayout>
                  </FieldSet>
                </Grid>
                <Grid item xs={6} sx={{ display: 'flex', flex: 1 }}>
                  <FieldSet sx={{ flex: 1 }}>
                    <VertLayout>
                      <Fixed>
                        <Grid container xs={12} spacing={2}>
                          <Grid item xs={9}>
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
                          <Grid item xs={3}>
                            <Button
                              onClick={() => copyRowValues(saFormik)}
                              variant='contained'
                              disabled={
                                !saFormik?.values?.rows ||
                                !formik.values.saRateTypeId ||
                                !saFormik?.values?.rows[0]?.rateCalcMethod ||
                                !saFormik?.values?.rows[0]?.rate ||
                                !saFormik?.values?.rows[0]?.minRate ||
                                !saFormik?.values?.rows[0]?.maxRate
                              }
                            >
                              Copy
                            </Button>
                          </Grid>
                        </Grid>
                      </Fixed>
                      <Grow>
                        {formik.values.currencyId != null && formik.values.saRateTypeId != null && (
                          <DataGrid
                            onChange={value => saFormik.setFieldValue('rows', value)}
                            value={saFormik.values.rows}
                            error={saFormik.errors.rows}
                            columns={exchangeRatesInlineGridColumns}
                            allowDelete={false}
                            allowAddNewLine={false}
                          />
                        )}
                      </Grow>
                    </VertLayout>
                  </FieldSet>
                </Grid>
              </Grid>
            </Grow>
          </VertLayout>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default CTExchangeRates
