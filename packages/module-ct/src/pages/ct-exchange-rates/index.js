import React from 'react'
import { Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { getButtons } from '@argus/shared-ui/src/components/Shared/Buttons'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ClearDialog from '@argus/shared-ui/src/components/Shared/ClearDialog'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const CTExchangeRates = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const [plantStore, setPlantsStore] = useState([])
  const clearButton = getButtons(platformLabels)?.find(({ key }) => key === 'Clear') || null
  const { stack } = useWindow()

  const raCurrencyId = parseInt(systemDefaults?.list?.find(({ key }) => key === 'baseCurrencyId')?.value) || null

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.CtExchangeRates
  })

  const ItemSchema = yup.object({
    minRate: yup
      .number()
      .required()
      .test(function (value) {
        const { rate } = this.parent
        if (value == null || rate == null) return true

        return value <= rate
      }),
    maxRate: yup
      .number()
      .required()
      .test(function (value) {
        const { rate } = this.parent
        if (value == null || rate == null) return true

        return value >= rate
      }),
    rate: yup
      .number()
      .required()
      .test(function (value) {
        const { minRate, maxRate } = this.parent
        if (value == null || minRate == null || maxRate == null) return true

        return value >= minRate && value <= maxRate
      }),
    rateCalcMethodName: yup.string().required()
  })

  const { formik } = useForm({
    maxAccess: access,
    validationSchema: yup.object({
      currencyId: yup.number().required(),
      rateAgainst: yup.number().required(),
      raCurrencyId: yup.number().required(),
      purchases: yup
        .mixed()
        .when(['currencyId', 'puRateTypeId'], ([currencyId, puRateTypeId], schema) =>
          currencyId && puRateTypeId ? yup.array().of(ItemSchema).min(1).required() : schema.notRequired()
        ),

      sales: yup
        .mixed()
        .when(['currencyId', 'saRateTypeId'], ([currencyId, saRateTypeId], schema) =>
          currencyId && saRateTypeId ? yup.array().of(ItemSchema).min(1).required() : schema.notRequired()
        )
    }),
    initialValues: {
      currencyId: null,
      rateAgainst: 1,
      raCurrencyId,
      puRateTypeId: null,
      saRateTypeId: null,
      purchases: [
        {
          id: 1,
          currencyId: null,
          raCurrencyId: null,
          rateTypeId: null,
          plantId: null,
          rateCalcMethod: null,
          minRate: null,
          maxRate: null,
          rate: null
        }
      ],
      sales: [
        {
          id: 1,
          currencyId: null,
          raCurrencyId: null,
          rateTypeId: null,
          plantId: null,
          rateCalcMethod: null,
          minRate: null,
          maxRate: null,
          rate: null
        }
      ]
    },
    onSubmit: async values => {
      if (values.puRateTypeId)
        await postExchangeMaps(values.purchases, values.currencyId, values.raCurrencyId, values.puRateTypeId)
      if (values.saRateTypeId)
        await postExchangeMaps(values.sales, values.currencyId, values.raCurrencyId, values.saRateTypeId)

      toast.success(platformLabels.Saved)
    }
  })

  console.log(formik.values, raCurrencyId)

  const exchangeRatesInlineGridColumns = [
    {
      component: 'textfield',
      label: labels.plant,
      name: 'plantName',
      props: { readOnly: true }
    },
    {
      component: 'resourcecombobox',
      label: labels.rcm,
      name: 'rateCalcMethodName',
      props: {
        datasetId: DataSets.MC_RATE_CALC_METHOD,
        displayField: 'value',
        refresh: false,
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

  const postExchangeMaps = async (rows, currencyId, raCurrencyId, rateTypeId) => {
    const data = {
      currencyId,
      rateTypeId,
      raCurrencyId,
      exchangeMaps: rows
    }

    await postRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.set2,
      record: JSON.stringify(data)
    })
  }

  useEffect(() => {
    if (formik.values.currencyId && formik.values.puRateTypeId && formik.values.raCurrencyId) {
      getExchangeRates(formik.values.currencyId, formik.values.puRateTypeId, formik.values.raCurrencyId, 'purchases')
    }
  }, [formik.values.currencyId, formik.values.raCurrencyId, formik.values.puRateTypeId])

  useEffect(() => {
    if (formik.values.currencyId && formik.values.saRateTypeId && formik.values.raCurrencyId) {
      getExchangeRates(formik.values.currencyId, formik.values.saRateTypeId, formik.values.raCurrencyId, 'sales')
    }
  }, [formik.values.currencyId, formik.values.raCurrencyId, formik.values.saRateTypeId])

  useEffect(() => {
    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: ''
    }).then(plants => {
      setPlantsStore(plants.list || [])
    })
  }, [])

  useEffect(() => {
    formik.setFieldValue('raCurrencyId', raCurrencyId)
  }, [raCurrencyId])

  const getExchangeRates = async (cuId, rateTypeId, raCurrencyId, tableName) => {
    formik.setFieldValue(tableName, [])
    if (cuId && raCurrencyId && rateTypeId) {
      const values = await getRequest({
        extension: CurrencyTradingSettingsRepository.ExchangeMap.qry,
        parameters: `_currencyId=${cuId}&_rateTypeId=${rateTypeId}&_raCurrencyId=${raCurrencyId}`
      })

      const valuesMap = values.list?.reduce((acc, fee) => {
        acc[fee.plantId] = fee

        return acc
      }, {})

      const rows = plantStore.map((plant, index) => {
        const value = valuesMap?.[plant.recordId] || 0

        return {
          id: index,
          currencyId: cuId,
          raCurrencyId,
          rateTypeId,
          plantId: plant.recordId,
          plantName: plant.name,
          rateCalcMethod: value.rateCalcMethod,
          rateCalcMethodName: value.rateCalcMethodName,
          rate: value.rate,
          minRate: value.minRate,
          maxRate: value.maxRate
        }
      })

      formik.setFieldValue(tableName, rows)
    }
  }

  const copyRowValues = tableName => {
    const firstRow = formik.values?.[tableName][0]

    const rows = formik.values?.[tableName].map(row => {
      return {
        ...row,
        minRate: firstRow.minRate,
        maxRate: firstRow.maxRate,
        rate: firstRow.rate,
        rateCalcMethod: firstRow.rateCalcMethod,
        rateCalcMethodName: firstRow.rateCalcMethodName
      }
    })

    formik.setFieldValue(tableName, rows)
  }

  const emptyExchangeMapsRowValues = async (tableName, rateTypeId) => {
    const data = {
      currencyId: formik.values.currencyId,
      rateTypeId,
      raCurrencyId: formik.values.raCurrencyId,
      exchangeMaps: []
    }
    await postRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.set2,
      record: JSON.stringify(data)
    }).then(res => {
      getExchangeRates(formik.values.currencyId, rateTypeId, formik.values.raCurrencyId, tableName)
      toast.success(platformLabels.Saved)
    })
  }

  function openClear(tableName, rateTypeId) {
    stack({
      Component: ClearDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => emptyExchangeMapsRowValues(tableName, rateTypeId)
      }
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Grow>
          <Grid container xs={12} sx={{ flexDirection: 'column' }} p={2}>
            <Fixed>
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
                    onChange={(_, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
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
                    refresh={false}
                    required
                    onChange={(_, newValue) => {
                      const key = newValue?.key ?? null
                      formik.setFieldValue('rateAgainst', key)
                      if (!key) {
                        formik.setFieldValue('raCurrencyId', null)
                      } else {
                        if (key === '1' && raCurrencyId) formik.setFieldValue('raCurrencyId', parseInt(raCurrencyId))
                      }
                    }}
                    error={formik.touched.rateAgainst && Boolean(formik.errors.rateAgainst)}
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
                    readOnly={!formik.values.rateAgainst || formik.values.rateAgainst === '1'}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('raCurrencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.raCurrencyId && Boolean(formik.errors.raCurrencyId)}
                  />
                </Grid>
              </Grid>
            </Fixed>

            <Grid container sx={{ flex: 1 }}>
              <Grid item xs={6} sx={{ display: 'flex', flex: 1 }}>
                <FieldSet sx={{ flex: 1 }}>
                  <VertLayout>
                    <Fixed>
                      <Grid container xs={12} spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={8}>
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
                            onChange={(_, newValue) => {
                              formik.setFieldValue('puRateTypeId', newValue?.recordId || null)
                            }}
                            error={formik.touched.puRateTypeId && Boolean(formik.errors.puRateTypeId)}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <CustomButton
                            onClick={() => copyRowValues('purchases')}
                            label={labels.copy}
                            disabled={
                              !formik?.values?.purchases ||
                              !formik.values.puRateTypeId ||
                              !formik?.values?.purchases[0]?.rateCalcMethod ||
                              !formik?.values?.purchases[0]?.rate ||
                              !formik?.values?.purchases[0]?.minRate ||
                              !formik?.values?.purchases[0]?.maxRate
                            }
                          />

                          <CustomButton
                            onClick={() => openClear('purchases', formik.values.puRateTypeId)}
                            image={`${clearButton.image}`}
                            color={clearButton.color}
                            disabled={
                              !formik?.values?.purchases ||
                              !formik.values.puRateTypeId ||
                              !formik?.values?.purchases[0]?.rateCalcMethod ||
                              !formik?.values?.purchases[0]?.rate ||
                              !formik?.values?.purchases[0]?.minRate ||
                              !formik?.values?.purchases[0]?.maxRate
                            }
                          />
                        </Grid>
                      </Grid>
                    </Fixed>
                    <Grow>
                      {formik.values.currencyId && formik.values.raCurrencyId && formik.values.puRateTypeId && (
                        <DataGrid
                          name='purchases'
                          onChange={value => formik.setFieldValue('purchases', value)}
                          value={formik.values.purchases}
                          error={formik.errors.purchases}
                          columns={exchangeRatesInlineGridColumns}
                          allowDelete={false}
                          allowAddNewLine={false}
                          maxAccess={access}
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
                      <Grid container xs={12} spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={8}>
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
                            onChange={(_, newValue) => {
                              formik.setFieldValue('saRateTypeId', newValue?.recordId || null)
                            }}
                            error={formik.touched.saRateTypeId && Boolean(formik.errors.saRateTypeId)}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <CustomButton
                            label={labels.copy}
                            onClick={() => copyRowValues('sales')}
                            disabled={
                              !formik?.values?.sales ||
                              !formik.values.saRateTypeId ||
                              !formik?.values?.sales[0]?.rateCalcMethod ||
                              !formik?.values?.sales[0]?.rate ||
                              !formik?.values?.sales[0]?.minRate ||
                              !formik?.values?.sales[0]?.maxRate
                            }
                          />

                          <CustomButton
                            onClick={() => openClear('sales', formik.values.saRateTypeId)}
                            image={`${clearButton.image}`}
                            color={clearButton.color}
                            disabled={
                              !formik?.values?.sales ||
                              !formik.values.saRateTypeId ||
                              !formik?.values?.sales[0]?.rateCalcMethod ||
                              !formik?.values?.sales[0]?.rate ||
                              !formik?.values?.sales[0]?.minRate ||
                              !formik?.values?.sales[0]?.maxRate
                            }
                          />
                        </Grid>
                      </Grid>
                    </Fixed>
                    <Grow>
                      {formik.values.currencyId && formik.values.raCurrencyId && formik.values.saRateTypeId && (
                        <DataGrid
                          name='sales'
                          onChange={value => formik.setFieldValue('sales', value)}
                          value={formik.values.sales}
                          error={formik.errors.sales}
                          columns={exchangeRatesInlineGridColumns}
                          allowDelete={false}
                          allowAddNewLine={false}
                          maxAccess={access}
                        />
                      )}
                    </Grow>
                  </VertLayout>
                </FieldSet>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CTExchangeRates
