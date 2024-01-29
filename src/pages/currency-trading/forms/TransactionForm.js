import { Button } from '@mui/material'
import { Checkbox, FormControlLabel, Grid, Radio, RadioGroup } from '@mui/material'
import { useFormik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import CustomCheckbox from 'src/@core/components/custom-checkbox/basic'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import FormShell from 'src/components/Shared/FormShell'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useError } from 'src/error'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingClientRepository } from 'src/repositories/CurrencyTradingClientRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import * as yup from 'yup'

const FormContext = React.createContext(null)

function FormField({ name, Component, valueField, ...rest }) {
  const { formik, labels } = useContext(FormContext)

  return (
    <Component
      {...rest}
      {...{ name, label: labels[name], values: formik.values, value: formik.values[name], error: formik.errors[name] }}
      onChange={(e, v) => {
        formik.setFieldValue(name, v ? v[valueField] ?? v : e.target.value)
      }}
    />
  )
}

function FormProvider({ formik, maxAccess, labels, children }) {
  return <FormContext.Provider value={{ formik, maxAccess, labels }}>{children}</FormContext.Provider>
}

export default function TransactionForm({ labels, maxAccess }) {
  const { getRequest } = useContext(RequestsContext)

  const { stack } = useError()

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string(),
      date: yup.date().required(),
      status: yup.number().required(),
      type: yup.string().required()
    }),
    initialValues: {
      reference: '',
      status: 1,
      date: '',
      type: '',
      rows: [
        {
          sl: 1,
          currencyId: '',
          fcAmount: 0,
          exRate: 0,
          lcAmount: 0
        }
      ]
    },
    onSubmit(values) {
      const payload = {
        header: {
          dtId: 0,
          reference: '',
          status: '',
          date: new Date(),
          functionId: 0,
          plantId: 0,
          clientId: 0,
          cashAccountId: 0,
          poeId: 0,
          wip: 0,
          amount: 381.323,
          notes: values.notes
        },
        items: [
          {
            cashInvoiceId: 12345,
            seqNo: 1,
            type: 2,
            currencyId: 567,
            fcAmount: 100.0,
            exRate: 1.5,
            rateCalcMethod: 1,
            lcAmount: 150.0
          }
        ],
        clientIndividual: {
          idtName: 'Passport',
          idCityName: 'New York',
          idCountryName: 'USA'
        },
        clientID: {
          idNo: 'ABCD1234',
          clientId: 9876,
          idCountryId: 1,
          idtId: 123,
          idExpiryDate: '2024-12-31T00:00:00',
          idIssueDate: '2020-01-15T00:00:00',
          idCityId: null,
          isDiplomat: false
        }
      }
    }
  })

  const [type, setType] = useState(null)

  async function setOperationType(type) {
    const res = await getRequest({
      extension: 'SY.asmx/getDE',
      parameters: type === 'purchase' ? '_key=mc_defaultRTPU' : type === 'sale' ? '_key=mc_defaultRTSA' : ''
    })
    setType(res.record.value)
  }

  const [currencyStore, setCurrencyStore] = useState([])

  useEffect(() => {
    ;(async function () {
      const response = await getRequest({
        extension: SystemRepository.Currency.qry,
        parameters: '_filter='
      })

      setCurrencyStore(response.list)
    })()
  }, [])

  const PLANT_ID = 3

  async function fetchRate({ currencyId }) {
    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeRate.get,
      parameters: `_plantId=${PLANT_ID}&_currencyId=${currencyId}&_rateTypeId=${type}`
    })
    return response.record
  }

  const total = formik.values.rows.reduce((acc, { lcAmount }) => acc + lcAmount, 0)

  return (
    <FormShell form={formik}>
      <FormProvider formik={formik} labels={labels} maxAccess={maxAccess}>
        <Grid container sx={{ px: 2 }} gap={3}>
          <FieldSet title='Transaction'>
            <Grid container spacing={4}>
              <Grid item xs={4}>
                <FormField name='reference' Component={CustomTextField} disabled />
              </Grid>
              <Grid item xs={4}>
                <FormField name='date' Component={CustomDatePicker} />
              </Grid>
              <Grid item xs={4}>
                <FormField name='status' Component={ResourceComboBox} valueField='key' datasetId={7} disabled />
              </Grid>
              <Grid item xs={4}>
                <RadioGroup row onChange={e => setOperationType(e.target.value)}>
                  <FormControlLabel value='purchase' control={<Radio />} label={labels.purchase} disabled={!!type} />
                  <FormControlLabel value='sale' control={<Radio />} label={labels.sale} disabled={!!type} />
                </RadioGroup>
              </Grid>
              <Grid item xs={4}>
                <RadioGroup row>
                  <FormControlLabel value='individual' control={<Radio />} label={labels.individual} />
                  <FormControlLabel value='corporate' control={<Radio />} label={labels.corporate} disabled />
                </RadioGroup>
              </Grid>
              <Grid item xs={4}>
                <FormField
                  name='clientId'
                  Component={ResourceComboBox}
                  endpointId={CurrencyTradingClientRepository.Client.snapshot}
                  parameters='_filter=1&_category=1'
                />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title='Operations'>
            <Grid item xs={12}>
              {type ? (
                <>
                  <InlineEditGrid
                    maxAccess={maxAccess}
                    gridValidation={formik}
                    scrollHeight={350}
                    width={750}
                    columns={[
                      {
                        field: 'incremented',
                        header: 'SL#',
                        name: 'sl',
                        readOnly: true,
                        valueSetter: () => {
                          return formik.values.rows.length + 1
                        }
                      },
                      {
                        field: 'combobox',
                        valueField: 'recordId',
                        displayField: 'reference',
                        header: 'Currency',
                        name: 'currencyId',
                        store: currencyStore,
                        columnsInDropDown: [{ key: 'reference', value: 'Symbol' }],
                        async onChange(row) {
                          const exchange = await fetchRate({
                            currencyId: row.newValue
                          })

                          if (!exchange?.exchangeRate?.rate) {
                            stack({
                              message: `Rate not defined for ${row.value}.`
                            })
                            return
                          }

                          formik.setFieldValue(`rows[${row.rowIndex}].exRate`, exchange.exchangeRate.rate)
                          formik.setFieldValue(`rows[${row.rowIndex}].method`, exchange.exchange.rateCalcMethod)
                          row.rowData.exRate = exchange.exchangeRate.rate
                          row.rowData.method = exchange.exchange.rateCalcMethod
                        }
                      },
                      {
                        field: 'numberfield',
                        header: 'FC Amount',
                        name: 'fcAmount',
                        async onChange(e) {
                          const {
                            rowIndex,
                            rowData: { exRate, method },
                            newValue
                          } = e

                          const lcAmount = method === 1 ? newValue * exRate : method === 2 ? newValue / exRate : 0
                          formik.setFieldValue(`rows[${rowIndex}].lcAmount`, lcAmount)
                          e.rowData.lcAmount = lcAmount
                        }
                      },
                      {
                        field: 'textfield',
                        header: 'Rate',
                        name: 'exRate',
                        readOnly: true
                      },
                      {
                        field: 'textfield',
                        header: 'LC Amount',
                        name: 'lcAmount',
                        readOnly: true
                      }
                    ]}
                    defaultRow={{
                      sl: 0,
                      currencyId: '',
                      fcAmount: 0,
                      exRate: 0,
                      lcAmount: 0
                    }}
                  />
                </>
              ) : (
                'Type not specified. Please choose Sale or Purchase.'
              )}
            </Grid>
          </FieldSet>
          <FieldSet title='Individual'>
            <Grid container spacing={4}>
              <Grid item xs={2}>
                <FormField name='id_number' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <Button>Fetch</Button>
              </Grid>
              <Grid item xs={2}>
                <FormField name='firstName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='middleName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='lastName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='familyName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='birth_date' Component={CustomDatePicker} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='birth_date' Component={CustomDatePicker} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_firstName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_middleName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_lastName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_familyName' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <CustomTextField label='ID Type' />
              </Grid>
              <Grid item xs={2}>
                {/* <Button>Visa</Button>
                <Button>Scan ID</Button> */}
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField name='sponsor' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='expiry_date' Component={CustomDatePicker} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='expiry_date' Component={CustomDatePicker} />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField name='purpose_of_exchange' Component={CustomTextField} />
              </Grid>
              <Grid item xs={4}>
                <FormField
                  name='issue_country'
                  Component={ResourceComboBox}
                  endpointId={SystemRepository.Country.qry}
                  valueField='recordId'
                  displayField='name'
                />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <CustomTextField label='Source of Income' />
              </Grid>
              <Grid item xs={4}>
                <FormField name='source_of_income' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField name='profession' Component={CustomTextField} />
              </Grid>
              <Grid item xs={4}>
                <FormField name='cell_phone' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField name='remarks' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='resident' Component={CustomCheckbox} control={<Checkbox />} />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title='Amount'>
            <Grid container spacing={4}>
              <Grid item xs={3}>
                <CustomTextField label='Net Amount' value={total} disabled />
              </Grid>
              <Grid item xs={3}>
                <CustomTextField label='Amount Recieved' disabled />
              </Grid>
              <Grid item xs={3}>
                <CustomTextField label='Mode of Pay' disabled />
              </Grid>
              <Grid item xs={3}>
                <CustomTextField label='Balance To Pay' disabled />
              </Grid>
            </Grid>
          </FieldSet>
        </Grid>
      </FormProvider>
    </FormShell>
  )
}
