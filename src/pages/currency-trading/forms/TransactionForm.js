import { Checkbox, FormControlLabel, Grid, Radio, RadioGroup } from '@mui/material'
import dayjs from 'dayjs'
import { useFormik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import FormShell from 'src/components/Shared/FormShell'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useError } from 'src/error'
import { formatDateToApiFunction } from 'src/lib/date-helper'
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
      {...{
        ...rest,
        name,
        label: labels[name],
        values: formik.values,
        value: formik.values[name],
        error: formik.errors[name],
        errors: formik.errors
      }}
      onChange={(e, v) => {
        formik.setFieldValue(name, v ? v[valueField] ?? v : e.target.value)
      }}
      form={formik}
    />
  )
}

function FormProvider({ formik, maxAccess, labels, children }) {
  return <FormContext.Provider value={{ formik, maxAccess, labels }}>{children}</FormContext.Provider>
}

function useLookup({ endpointId, parameters }) {
  const [store, setStore] = useState([])

  const { getRequest } = useContext(RequestsContext)

  return {
    store,
    lookup(searchQry) {
      getRequest({
        extension: endpointId,
        parameters: new URLSearchParams({ ...parameters, _filter: searchQry })
      }).then(res => {
        setStore(res.list)
      })
    },
    valueOf(id) {
      return store.find(({ recordId }) => recordId === id)
    },
    clear() {
      setStore([])
    }
  }
}

export default function TransactionForm({ recordId, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack: stackError } = useError()

  const [initialValues, setInitialValues] = useState({
    reference: '',
    status: '1',
    type: -1,
    clientType: 1,
    clientId: null,
    wip: 1,
    rows: [
      {
        seqNo: 1,
        currencyId: '',
        fcAmount: 0,
        exRate: 0,
        lcAmount: 0
      }
    ],
    birth_date: null,
    expiry_date: null,
    resident: false
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: yup.object({
      // reference: yup.string(),
      // date: yup.date().required(),
      // status: yup.string().required(),
      // type: yup.number().required(),
      // birth_date: yup.date().required(),
      // firstName: yup.string().required(),
      // middleName: yup.string().required(),
      // lastName: yup.string().required(),
      // familyName: yup.string().required()
    }),
    initialValues,
    onSubmit
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

      // if (recordId) {
      //   const res = await getRequest({
      //     extension: 'CTTRX.asmx/get2CIV',
      //     parameters: `_recordId=${recordId}`
      //   })

      //   setInitialValues({

      //   })
      // }

      setCurrencyStore(response.list)
    })()
  }, [])

  const [plantId, setPlantId] = useState(null)

  const { userId } = JSON.parse(window.localStorage.getItem('userData'))

  async function fetchRate({ currencyId }) {
    const { record } = await getRequest({
      extension: `SY.asmx/getUD`,
      parameters: `_userId=${userId}&_key=plantId`
    })
    setPlantId(record.value)

    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeRate.get,
      parameters: `_plantId=${record.value}&_currencyId=${currencyId}&_rateTypeId=${type}`
    })

    return response.record
  }

  const total = formik.values.rows.reduce((acc, { lcAmount }) => acc + lcAmount, 0)

  const { lookup, store, valueOf, clear } = useLookup({
    endpointId: CurrencyTradingClientRepository.Client.snapshot,
    parameters: { _category: 1 }
  })

  async function onSubmit(values) {
    const functionId = values.type === 1 ? 3502 : 3503

    const { record: recordFunctionId } = await getRequest({
      extension: `SY.asmx/getUFU`,
      parameters: `_userId=${userId}&_functionId=${functionId}`
    })

    const { dtId } = recordFunctionId

    const { record: cashAccountRecord } = await getRequest({
      extension: `SY.asmx/getUD`,
      parameters: `_userId=${userId}&_key=cashAccountId`
    })

    const clientId = values.clientId ?? 0

    const payload = {
      header: {
        dtId,
        reference: null,
        status: values.status,
        date: formatDateToApiFunction(values.date),
        functionId,
        plantId: plantId,
        clientId,
        cashAccountId: cashAccountRecord.value,
        poeId: values.purpose_of_exchange,
        wip: values.wip,
        amount: total,
        notes: values.remarks
      },
      items: values.rows.map(({ seqNo, currencyId, exRate, rateCalcMethod, fcAmount, lcAmount, ...rest }) => ({
        seqNo,
        currencyId,
        exRate,
        rateCalcMethod,
        fcAmount: parseFloat(fcAmount),
        lcAmount: parseFloat(lcAmount)
      })),
      clientMaster: {
        category: values.clientType,
        reference: null,
        name: null,
        flName: null,
        keyword: null,
        nationalityId: values.nationality,
        status: 1,
        addressId: null,
        cellPhone: values.cell_phone,
        oldReference: null,
        otp: null,
        createdDate: dayjs(),
        expiryDate: null
      },
      clientIndividual: {
        clientId,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
        familyName: values.familyName,
        fl_firstName: values.fl_firstName,
        fl_lastName: values.fl_lastName,
        fl_middleName: values.fl_middleName,
        fl_familyName: values.fl_familyName,
        birthDate: formatDateToApiFunction(values.birth_date),
        isResident: values.resident,
        professionId: values.profession,
        incomeSourceId: values.source_of_income,
        sponsorName: values.sponsor
      },
      clientID: {
        idNo: values.id_number,
        clientId,
        idCountryId: values.issue_country,
        idtId: values.id_type,
        idExpiryDate: formatDateToApiFunction(values.expiry_date),
        idIssueDate: null,
        idCityId: null,
        isDiplomat: false
      }
    }

    await postRequest({
      extension: 'CTTRX.asmx/set2CIV',
      record: JSON.stringify(payload)
    })
  }

  return (
    <FormShell form={formik} height={400}>
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
                <FormField
                  name='status'
                  Component={ResourceComboBox}
                  displayField='value'
                  valueField='key'
                  datasetId={7}
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <RadioGroup row onChange={e => setOperationType(e.target.value)}>
                  <FormControlLabel value='purchase' control={<Radio />} label={labels.purchase} disabled={!!type} />
                  <FormControlLabel value='sale' control={<Radio />} label={labels.sale} disabled={!!type} />
                </RadioGroup>
              </Grid>
              <Grid item xs={4}>
                <RadioGroup row value={formik.values.clientType} onChange={formik.onChange}>
                  <FormControlLabel value={1} control={<Radio />} label={labels.individual} />
                  <FormControlLabel value={2} control={<Radio />} label={labels.corporate} disabled />
                </RadioGroup>
              </Grid>
              <Grid item xs={4}>
                <CustomLookup
                  onChange={(e, v) => {
                    const client = valueOf(v.recordId)
                    formik.setFieldValue('clientId', client.recordId)
                  }}
                  valueField='name'
                  displayField='name'
                  setStore={clear}
                  store={store}
                  firstValue={valueOf(formik.values.clientId)}
                  secondDisplayField={false}
                  onLookup={lookup}
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
                        name: 'seqNo',
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
                            stackError({
                              message: `Rate not defined for ${row.value}.`
                            })
                            
                            return
                          }
                          formik.setFieldValue(`rows[${row.rowIndex}].currencyId`, row.newValue)
                          formik.setFieldValue(`rows[${row.rowIndex}].exRate`, exchange.exchangeRate.rate)
                          formik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod`, exchange.exchange.rateCalcMethod)
                          row.rowData.currencyId = row.newValue
                          row.rowData.exRate = exchange.exchangeRate.rate
                          row.rowData.rateCalcMethod = exchange.exchange.rateCalcMethod
                        }
                      },
                      {
                        field: 'numberfield',
                        header: 'FC Amount',
                        name: 'fcAmount',
                        async onChange(e) {
                          const {
                            rowIndex,
                            rowData: { exRate, rateCalcMethod },
                            newValue
                          } = e

                          const lcAmount =
                            rateCalcMethod === 1
                              ? parseInt(newValue) * exRate
                              : rateCalcMethod === 2
                              ? newValue / exRate
                              : 0
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
                        field: 'numberfield',
                        header: 'LC Amount',
                        name: 'lcAmount',
                        readOnly: true
                      }
                    ]}
                    defaultRow={{
                      seqNo: 0,
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
                {/* <Button
                  variant='contained'
                  onClick={() =>
                    stackWindow({
                      Component: Confirmation,
                      props: {
                        // idTypeStore: idTypeStore,
                        formik,
                        labels
                      },
                      width: 400,
                      height: 400,
                      title: 'Confirmation'
                    })
                  }
                  // disabled={
                  //   !formik?.values?.idtId || !formik?.values?.birthDate || !formik.values.idNo || editMode
                  //     ? true
                  //     : false
                  // }
                >
                  Fetch
                </Button> */}
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
                {/* <FormField name='birth_date' Component={CustomDatePicker} /> */}
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
                <FormField
                  name='id_type'
                  Component={ResourceComboBox}
                  endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                  valueField='recordId'
                  displayField='name'
                />
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
                {/* <FormField name='expiry_date' Component={CustomDatePicker} /> */}
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField
                  name='purpose_of_exchange'
                  Component={ResourceComboBox}
                  endpointId={'CTSET.asmx/qryPEX'}
                  valueField='recordId'
                  displayField='name'
                />
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
                <FormField
                  name='source_of_income'
                  Component={ResourceComboBox}
                  endpointId={'RTSET.asmx/qrySI'}
                  valueField='recordId'
                  displayField='name'
                />
              </Grid>
              <Grid item xs={4}>
                <FormField
                  name='nationality'
                  Component={ResourceComboBox}
                  endpointId={SystemRepository.Country.qry}
                  valueField='recordId'
                  displayField='name'
                />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField
                  name='profession'
                  Component={ResourceComboBox}
                  endpointId={'RTSET.asmx/qryPFN'}
                  valueField='recordId'
                  displayField='name'
                />
              </Grid>
              <Grid item xs={4}>
                <FormField name='cell_phone' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField name='remarks' Component={CustomTextField} />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  name='resident'
                  checked={formik.values.resident}
                  onChange={formik.handleChange}
                  control={<Checkbox defaultChecked />}
                  label='Resident'
                />
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
