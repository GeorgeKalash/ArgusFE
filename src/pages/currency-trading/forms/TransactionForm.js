import { Button, Checkbox, FormControlLabel, Grid, Radio, RadioGroup } from '@mui/material'
import dayjs from 'dayjs'
import { useFormik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import Confirmation from 'src/components/Shared/Confirmation'
import FieldSet from 'src/components/Shared/FieldSet'
import FormShell from 'src/components/Shared/FormShell'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useError } from 'src/error'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { CurrencyTradingClientRepository } from 'src/repositories/CurrencyTradingClientRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
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
  const [editMode, setEditMode] = useState(!!recordId)
  const [infoAutoFilled, setInfoAutoFilled] = useState(false)
  const [idInfoAutoFilled, setIDInfoAutoFilled] = useState(false)
  const { stack: stackError } = useError()
  const { stack } = useWindow();
  const [idTypeStore, setIdTypeStore] = useState([]);

  const [initialValues, setInitialValues] = useState({
    recordId: null,
    reference: '',
    status: '1',
    type: -1,
    clientType: 1,
    clientId: '',
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
    resident: false,
    functionId: '',
    clientId: ''
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: yup.object({
      id_type: yup.number().required(),
      id_number: yup.number().required(),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      issue_country: yup.string().required(),
      nationality: yup.string().required(),
      cell_phone: yup.string().required(),
      profession: yup.string().required()

    }),
    initialValues,
    onSubmit
  })

  const [rateType, setRateType] = useState(null)

  async function setOperationType(type) {
    const res = await getRequest({
      extension: 'SY.asmx/getDE',
      parameters: type === '3502' ? '_key=mc_defaultRTPU' : type === '3503' ? '_key=mc_defaultRTSA' : ''
    })
    setRateType(res.record.value)
    formik.setFieldValue('functionId', type)
  }

  const [currencyStore, setCurrencyStore] = useState([])

  const fillType = () => {
    var parameters = `_filter=`;
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.qry,
      parameters: parameters,
    })
      .then((res) => {
        setIdTypeStore(res.list);
      })
      .catch((error) => {
        // setErrorMessage(error);
      });
  };
  useEffect(() => {
    const date = new Date();

   !editMode && formik.setFieldValue( 'date' , date)

   fillType()


    ;(async function () {
      const response = await getRequest({
        extension: SystemRepository.Currency.qry,
        parameters: '_filter='
      })

      if (recordId) {
        const { record } = await getRequest({
          extension: 'CTTRX.asmx/get2CIV',
          parameters: `_recordId=${recordId}`
        })

        setInitialValues({
          ...initialValues,
          recordId: recordId,
          status: record.headerView.status,
          reference: record.headerView.reference,
          rows: record.items,
          plantId: record.headerView.plantId,
          clientType: record.clientMaster.category,
          date: formatDateFromApi(record.headerView.date),
          clientId: record.clientIndividual.clientId,
          clientName: record.headerView.clientName,
          firstName: record.clientIndividual.firstName,
          lastName: record.clientIndividual.lastName,
          middleName: record.clientIndividual.middleName,
          familyName: record.clientIndividual.familyName,
          fl_firstName: record.clientIndividual.fl_firstName,
          fl_lastName: record.clientIndividual.fl_lastName,
          fl_middleName: record.clientIndividual.fl_middleName,
          fl_familyName: record.clientIndividual.fl_familyName,
          birth_date: formatDateFromApi(record.clientIndividual.birthDate),
          resident: record.clientIndividual.isResident,
          profession: record.clientIndividual.professionId,
          source_of_income: record.clientIndividual.incomeSourceId,
          sponsor: record.clientIndividual.sponsorName,
          id_number: record.clientIDView.idNo,
          issue_country: record.clientIDView.idCountryId,
          id_type: record.clientIDView.idtId,
          expiry_date: formatDateFromApi(record.clientIDView.idExpiryDate),
          remarks: record.headerView.notes,
          purpose_of_exchange: record.headerView.poeId,
          nationality: record.clientMaster.nationalityId,
          cell_phone: record.clientMaster.cellPhone
        })
        setOperationType(record.headerView.functionId.toString())
      }

      setCurrencyStore(response.list)
    })()
  }, [])

  const [currentPlantId, setPlantId] = useState(null)

  const { userId } = JSON.parse(window.localStorage.getItem('userData'))

  async function fetchRate({ currencyId }) {
    const { record } = await getRequest({
      extension: `SY.asmx/getUD`,
      parameters: `_userId=${userId}&_key=plantId`
    })
    setPlantId(record.value)

    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeRate.get,
      parameters: `_plantId=${record.value}&_currencyId=${currencyId}&_rateTypeId=${rateType}`
    })

    return response.record
  }

  const total = formik.values.rows.reduce((acc, { lcAmount }) => acc + lcAmount, 0)

  const { lookup, store, valueOf, clear } = useLookup({
    endpointId: CurrencyTradingClientRepository.Client.snapshot,
    parameters: { _category: 1 }
  })

  async function onSubmit(values) {
    const { record: recordFunctionId } = await getRequest({
      extension: `SY.asmx/getUFU`,
      parameters: `_userId=${userId}&_functionId=${values.functionId}`
    })

    const { dtId: userDtId } = recordFunctionId

    const { record: currentCashAccountRecord } = await getRequest({
      extension: `SY.asmx/getUD`,
      parameters: `_userId=${userId}&_key=cashAccountId`
    })

    const clientId = values.clientId || 0

    const payload = {
      header: {
        dtId: values.dtId || userDtId,
        reference: values.reference,
        status: values.status,
        date: formatDateToApiFunction(values.date),
        functionId: values.functionId,
        plantId: values.plantId || currentPlantId,
        clientId,
        cashAccountId: values.cashAccountId || currentCashAccountRecord.value,
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
        fcAmount: parseFloat(fcAmount.toString().replace(/,/g, '')),
        lcAmount: parseFloat(lcAmount.toString().replace(/,/g, ''))
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
        createdDate: formatDateToApiFunction(values.date),
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

    const response = await postRequest({
      extension: 'CTTRX.asmx/set2CIV',
      record: JSON.stringify(payload)
    })

    if (!values.recordId) {
      toast.success('Record Added Successfully')
      setInitialValues({
        ...values,
        recordId: response.recordId
      })
    } else toast.success('Record Edited Successfully')
    setEditMode(true)
  }

  async function fetchClientInfo({ clientId }) {
    const response = await getRequest({
      extension: RTCLRepository.Client.get,
      parameters: `_clientId=${clientId}`
    })

    var clientInfo = response.record
    if (!!clientInfo) {
      formik.setFieldValue('firstName', clientInfo.firstName)
      formik.setFieldValue('middleName', clientInfo.middleName)
      formik.setFieldValue('lastName', clientInfo.lastName)
      formik.setFieldValue('familyName', clientInfo.familyName)
      formik.setFieldValue('fl_firstName', clientInfo.fl_firstName)
      formik.setFieldValue('fl_lastName', clientInfo.fl_lastName)
      formik.setFieldValue('fl_middleName', clientInfo.fl_middleName)
      formik.setFieldValue('fl_familyName', clientInfo.fl_familyName)
      formik.setFieldValue('birth_date', formatDateFromApi(clientInfo.birthDate))
      formik.setFieldValue('resident', clientInfo.isResident)
      formik.setFieldValue('profession', clientInfo.professionId)
      formik.setFieldValue('sponsor', clientInfo.sponsorName)
      formik.setFieldValue('source_of_income', clientInfo.incomeSourceId)
      setInfoAutoFilled(true)
    }
  }

  async function fetchIDInfo({ idNumber }) {
    const response = await getRequest({
      extension: CTCLRepository.IDNumber.get,
      parameters: `_idNo=${idNumber}`
    })

    return response.record
  }

  return (
    <FormShell height={400} form={formik} resourceId={35208} editMode={editMode}>
      <FormProvider formik={formik} labels={labels} maxAccess={maxAccess}>
        <Grid container sx={{ px: 2 }} gap={3}>
          <FieldSet title='Transaction'>
            <Grid container spacing={4}>
              <Grid item xs={4}>
                <FormField name='reference' Component={CustomTextField} readOnly  />
              </Grid>
              <Grid item xs={4}>
                <FormField name='date'  Component={CustomDatePicker} required readOnly={editMode}  />
              </Grid>
              <Grid item xs={4}>
                <FormField
                  name='status'
                  Component={ResourceComboBox}
                  displayField='value'
                  valueField='key'
                  datasetId={7}
                  readOnly
                />
              </Grid>
              <Grid item xs={4}>
                <RadioGroup row value={formik.values.functionId} onChange={e => setOperationType(e.target.value)}>
                  <FormControlLabel value={'3502'} control={<Radio />} label={labels.purchase} disabled={!!rateType} />
                  <FormControlLabel value={'3503'} control={<Radio />} label={labels.sale} disabled={!!rateType} />
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
                    if (client) {
                      formik.setFieldValue('clientId', client.recordId)
                      fetchClientInfo({ clientId: client.recordId })
                    }
                  }}
                  valueField='name'
                  displayField='name'
                  setStore={clear}
                  store={store}
                  value={formik.values.clientId}
                  firstValue={formik.values.clientName}
                  secondDisplayField={false}
                  onLookup={lookup}
                  readOnly={editMode || idInfoAutoFilled}
                />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title='Operations'>
            <Grid item xs={12}>
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
                    widthDropDown: '300',
                    columnsInDropDown: [
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ],
                    async onChange(row) {
                      if (!row.newValue) return

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
                      if (!newValue) return

                      const lcAmount =
                        rateCalcMethod === 1
                          ? parseFloat(newValue.toString().replace(/,/g, '')) * exRate
                          : rateCalcMethod === 2
                          ? parseFloat(newValue.toString().replace(/,/g, '')) / exRate
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
            </Grid>
          </FieldSet>
          <FieldSet title='Individual'>
            <Grid container spacing={4}>
              <Grid item xs={2}>
                <FormField
                  name='id_number'
                  Component={CustomTextField}
                  onBlur={e => {
                    fetchIDInfo({ idNumber: e.target.value })
                      .then(IDInfo => {
                        if (!!IDInfo) {
                          formik.setFieldValue('issue_country', IDInfo.idCountryId)
                          formik.setFieldValue('id_type', IDInfo.idtId)
                          formik.setFieldValue('expiry_date', formatDateFromApi(IDInfo.idExpiryDate))
                          if (IDInfo.clientId != null) {
                            fetchClientInfo({ clientId: IDInfo.clientId })
                          }
                          setIDInfoAutoFilled(true)
                        }
                      })
                      .catch(error => {
                        console.error('Error fetching ID info:', error)
                      })
                  }}
                  readOnly={editMode}
                  required
                />
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
              {/* <Grid item xs={2}>
                    <Button
                      variant="contained"
                      onClick={() =>
                        stack({
                          Component: Confirmation,
                          props: {
                            idTypeStore: idTypeStore,
                            formik: formik,

                            // setErrorMessage: setErrorMessage,
                            labels: labels,
                          },

                          // title: _labels.fetch,
                          width: 400,
                          height: 400,
                        })
                      }
                      disabled={
                        (!formik?.values?.id_type ||
                        !formik?.values?.birth_date ||
                        !formik.values.id_number ||
                        editMode)
                          ? true
                          : false
                      }
                    >
                      {"fetch"}
                    </Button>
                  </Grid> */}
              <Grid item xs={2}>
                <FormField
                  name='firstName'
                  Component={CustomTextField}
                  readOnly={editMode || infoAutoFilled}
                  required
                />
              </Grid>
              <Grid item xs={2}>
                <FormField name='middleName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='lastName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} required />
              </Grid>
              <Grid item xs={2}>
                <FormField name='familyName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
              </Grid>
              <Grid item xs={2}>
                <FormField
                  name='birth_date'
                  Component={CustomDatePicker}
                  readOnly={editMode || infoAutoFilled}
                  required
                />
              </Grid>
              <Grid item xs={2}>
                {/* <FormField name='birth_date' Component={CustomDatePicker} /> */}
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_firstName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_middleName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_lastName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
              </Grid>
              <Grid item xs={2}>
                <FormField name='fl_familyName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
              </Grid>
              <Grid item xs={2}>
                <FormField
                  name='id_type'
                  Component={ResourceComboBox}
                  endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                  valueField='recordId'
                  displayField='name'
                  readOnly={editMode || idInfoAutoFilled}
                  required
                />
              </Grid>
              <Grid item xs={2}>
                {/* <Button>Visa</Button>
                <Button>Scan ID</Button> */}
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField name='sponsor' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
              </Grid>
              <Grid item xs={2}>
                <FormField
                  name='expiry_date'
                  Component={CustomDatePicker}
                  readOnly={editMode || idInfoAutoFilled}
                  required
                />
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
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={editMode}
                />
              </Grid>
              <Grid item xs={4}>
                <FormField
                  name='issue_country'
                  Component={ResourceComboBox}
                  endpointId={SystemRepository.Country.qry}
                  valueField='recordId'
                  displayField={['reference', 'name', 'flName']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  readOnly={editMode || idInfoAutoFilled}
                  required
                />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField
                  name='source_of_income'
                  Component={ResourceComboBox}
                  endpointId={'RTSET.asmx/qrySI'}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={editMode || infoAutoFilled}
                />
              </Grid>
              <Grid item xs={4}>
                <FormField
                  name='nationality'
                  Component={ResourceComboBox}
                  endpointId={SystemRepository.Country.qry}
                  valueField='recordId'
                  displayField={['reference', 'name', 'flName']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  readOnly={editMode}
                  required
                />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField
                  name='profession'
                  Component={ResourceComboBox}
                  endpointId={'RTSET.asmx/qryPFN'}
                  required
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={editMode || infoAutoFilled}
                />
              </Grid>
              <Grid item xs={4}>
                <FormField name='cell_phone' Component={CustomTextField} readOnly={editMode} required />
              </Grid>
              <Grid item xs={2} />
              <Grid item xs={6}>
                <FormField name='remarks' Component={CustomTextField} readOnly={editMode} />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  name='resident'
                  checked={formik.values.resident}
                  onChange={formik.handleChange}
                  control={<Checkbox defaultChecked />}
                  label='Resident'
                  readOnly={editMode || infoAutoFilled}
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
