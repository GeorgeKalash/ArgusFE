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
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useError } from 'src/error'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { CommonContext } from 'src/providers/CommonContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { CurrencyTradingClientRepository } from 'src/repositories/CurrencyTradingClientRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import * as yup from 'yup'
import { DataSets } from 'src/resources/DataSets'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import useIdType from 'src/hooks/useIdType'
import { useInvalidate } from 'src/hooks/resource'
import ConfirmationOnSubmit from 'src/pages/currency-trading/forms/ConfirmationOnSubmit'

const FormContext = React.createContext(null)

export async function Country(getRequest) {
  var parameters = `_filter=&_key=countryId`

  const res = await getRequest({
    extension: SystemRepository.Defaults.get,
    parameters: parameters
  })

  return res.record.value
}

function FormField({ name, Component, valueField, onFocus, ...rest }) {
  const { formik, labels } = useContext(FormContext)
  const { getRequest } = useContext(RequestsContext)

  const getCountry = async () => {
    const countryId = await Country(getRequest)
    formik.setFieldValue('issue_country', parseInt(countryId))
  }

  return (
    <Component
      {...{
        ...rest,
        name,
        label: labels[name],
        values: formik.values,
        value: formik.values[name],
        error: formik.errors[name],
        errors: formik.errors,
        valueField: valueField
      }}
      onChange={(e, v) => {
        if (name === 'id_type' && v && v['type'] && (v['type'] === 1 || v['type'] === 2)) {
          getCountry()
        }
        formik.setFieldValue(name, v ? v[valueField] ?? v : e.target.value)
      }}
      onFocus={e => {
        if (onFocus && name == 'id_number') {
          onFocus(e.target.value)
        }
      }}
      onClear={() => {
        formik.setFieldValue(name, '')
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

export default function TransactionForm({ recordId, labels, maxAccess, plantId, setErrorMessage }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const [editMode, setEditMode] = useState(!!recordId)
  const [infoAutoFilled, setInfoAutoFilled] = useState(false)
  const [idInfoAutoFilled, setIDInfoAutoFilled] = useState(false)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const [idTypeStore, setIdTypeStore] = useState([])
  const [typeStore, setTypeStore] = useState([])
  const [creditCardStore, setCreditCardStore] = useState([])
  const [getValue] = useIdType()
  const [rateType, setRateType] = useState(null)
  const [idNumber, setIdNumber] = useState(null)

  async function checkTypes(value) {
    if (!value) {
      formik.setFieldValue('id_type', '')
    }
    const idType = await getValue(value)
    if (idType) {
      formik.setFieldValue('id_type', idType)
      if (idType) {
        const res = idTypeStore.filter(item => item.recordId === idType)[0]
        if (res.type === 1 || res.type === 2) {
          const countryId = await Country(getRequest)
          formik.setFieldValue('issue_country', parseInt(countryId))
        }
      }
    }
  }

  const invalidate = useInvalidate({
    endpointId: 'CTTRX.asmx/pageCIV'
  })

  const initial = {
    recordId: null,
    reference: null,
    rows: [
      {
        seqNo: 1,
        currencyId: '',
        fcAmount: '',
        defaultExRate: 0,
        exRate: '',
        lcAmount: '',
        minRate: 0,
        maxRate: 0
      }
    ],
    rows2: [
      {
        seqNo: 1,
        cashAccountId: '',
        cashInvoiceId: null,
        type: '',
        typeName: '',
        ccName: '',
        amount: '',
        ccId: '',
        bankFees: 0,
        receiptRef: ''
      }
    ],
    date: new Date(),
    clientId: null,
    clientName: null,
    clientType: '1',
    firstName: null,
    middleName: null,
    familyName: null,
    fl_firstName: null,
    fl_lastName: null,
    fl_middleName: null,
    fl_familyName: null,
    birth_date: null,
    resident: false,
    profession: null,
    source_of_income: null,
    sponsor: null,
    id_number: null,
    issue_country: null,
    id_type: null,
    expiry_date: null,
    remarks: null,
    purpose_of_exchange: null,
    nationality: null,
    cell_phone: null,
    status: '1',
    type: -1,
    wip: 1,
    functionId: '3502',
    idNoConfirm: '',
    cellPhoneConfirm: '',
    otp: false
  }

  const initial1 = {
    rows: [
      {
        seqNo: 1,
        cashAccountId: '',
        cashInvoiceId: null,
        type: '',
        typeName: '',
        ccName: '',
        amount: '',
        ccId: '',
        bankFees: 0,
        receiptRef: ''
      }
    ]
  }

  const [initialValues, setInitialValues] = useState({
    recordId: null,
    reference: null,
    rows: [
      {
        seqNo: 1,
        currencyId: '',
        fcAmount: '',
        defaultExRate: 0,
        exRate: '',
        lcAmount: '',
        minRate: 0,
        maxRate: 0
      }
    ],
    rows2: [
      {
        seqNo: 1,
        cashAccountId: '',
        cashInvoiceId: null,
        type: '',
        typeName: '',
        ccName: '',
        amount: '',
        ccId: '',
        bankFees: 0,
        receiptRef: ''
      }
    ],
    date: new Date(),
    clientId: null,
    clientName: null,
    clientType: '1',
    firstName: null,
    middleName: null,
    familyName: null,
    fl_firstName: null,
    fl_lastName: null,
    fl_middleName: null,
    fl_familyName: null,
    birth_date: null,
    resident: false,
    profession: null,
    source_of_income: null,
    sponsor: null,
    id_number: null,
    issue_country: null,
    id_type: null,
    expiry_date: null,
    remarks: null,
    purpose_of_exchange: null,
    nationality: null,
    cell_phone: null,
    status: editMode ? null : '1',
    type: -1,
    wip: 1,
    functionId: '3502',
    idNoConfirm: '',
    cellPhoneConfirm: '',
    otp: false
  })

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validate: values => {
      const type = values.rows2 && values.rows2.every(row => !!row.type)
      const amount = values.rows2 && values.rows2.every(row => !!row.amount)
      const fcAmount = values.rows && values.rows.every(row => !!row.fcAmount)
      const lcAmount = values.rows && values.rows.every(row => !!row.lcAmount)
      const exRate = values.rows && values.rows.every(row => !!row.exRate)

      return type && amount && exRate && lcAmount && fcAmount
        ? {}
        : {
            rows2: Array(values.rows2 && values.rows2.length).fill({
              amount: 'field is required',
              type: 'field is required'
            })
          }
    },
    validationSchema: yup.object({
      date: yup.string().required(),
      id_type: yup.number().required(),
      id_number: yup.number().required(),
      birth_date: yup.string().required(),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      expiry_date: yup.string().required(),
      issue_country: yup.string().required(),
      nationality: yup.string().required(),
      cell_phone: yup.string().required(),
      profession: yup.string().required()
    }),
    initialValues,

    // onReset,
    onSubmit
  })

  async function setOperationType(type) {
    if (type === '3502' || type === '3503') {
      const res = await getRequest({
        extension: 'SY.asmx/getDE',
        parameters: type === '3502' ? '_key=mc_defaultRTPU' : type === '3503' ? '_key=mc_defaultRTSA' : ''
      })
      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
    }
  }

  const [currencyStore, setCurrencyStore] = useState([])

  const fillType = () => {
    var parameters = `_filter=`
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.qry,
      parameters: parameters
    })
      .then(res => {
        setIdTypeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCreditCard = () => {
    var parameters = `_filter=`
    getRequest({
      extension: CashBankRepository.CreditCard.qry,
      parameters: parameters
    })
      .then(res => {
        setCreditCardStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCATypeStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.CA_CASH_ACCOUNT_TYPE,
      callback: setTypeStore
    })
  }

  useEffect(() => {
    fillType()
    fillCATypeStore()
    fillCreditCard()
    ;(async function () {
      setEditMode(false)

      const response = await getRequest({
        extension: SystemRepository.Currency.qry,
        parameters: '_filter='
      })
      setOperationType(formik?.values?.functionId)

      if (recordId) {
        setEditMode(true)
        getData(recordId)
      }

      setCurrencyStore(response.list)
    })()
  }, [])

  async function getData(id) {
    const _recordId = recordId ? recordId : id

    const { record } = await getRequest({
      extension: 'CTTRX.asmx/get2CIV',
      parameters: `_recordId=${_recordId}`
    })
    if (!recordId) {
      formik.setFieldValue('reference', record.headerView.reference)
    } else {
      formik.setValues({
        recordId: recordId,
        reference: record.headerView.reference,
        rows: record.items,
        rows2: record.cash,
        clientType: record.clientMaster.category,
        date: formatDateFromApi(record.headerView.date),
        clientId: record?.clientIndividual?.clientId,
        clientName: record.headerView.clientName,
        functionId: record.headerView.functionId,
        plantId: record.headerView.plantId,
        wip: record.headerView.wip,
        firstName: record?.clientIndividual?.firstName,
        lastName: record?.clientIndividual?.lastName,
        middleName: record?.clientIndividual?.middleName,
        familyName: record?.clientIndividual?.familyName,
        fl_firstName: record?.clientIndividual?.fl_firstName,
        fl_lastName: record?.clientIndividual?.fl_lastName,
        fl_middleName: record?.clientIndividual?.fl_middleName,
        fl_familyName: record?.clientIndividual?.fl_familyName,
        birth_date: formatDateFromApi(record?.clientIndividual?.birthDate),
        resident: record?.clientIndividual?.isResident,
        profession: record?.clientIndividual?.professionId,
        source_of_income: record?.clientIndividual?.incomeSourceId,
        sponsor: record?.clientIndividual?.sponsorName,
        id_number: record.clientIDView.idNo,
        issue_country: record.clientIDView.idCountryId,
        id_type: record.clientIDView.idtId,
        expiry_date: formatDateFromApi(record.clientIDView.idExpiryDate),
        remarks: record.headerView.notes,
        purpose_of_exchange: record.headerView.poeId,
        nationality: record.clientMaster.nationalityId,
        cell_phone: record.clientMaster.cellPhone,
        status: record.headerView.status
      })

      CashFormik.setValues({ rows: record.cash })
    }
  }

  // const [plantId, setPlantId] = useState(null)

  const { userId } = JSON.parse(window.sessionStorage.getItem('userData'))

  async function fetchRate({ currencyId }) {
    // const { record } = await getRequest({
    //   extension: `SY.asmx/getUD`,
    //   parameters: `_userId=${userId}&_key=plantId`
    // })
    // setPlantId(record.value)

    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
      parameters: `_plantId=${plantId}&_currencyId=${currencyId}&_rateTypeId=${rateType}`
    })

    return response.record
  }

  const total = formik.values.rows.reduce((acc, { lcAmount }) => {
    // Convert lcAmount to string and replace commas
    const amountString = String(lcAmount || 0).replaceAll(',', '')

    // Parse the amount and add to accumulator
    return acc + parseFloat(amountString) || 0
  }, 0)

  const receivedTotal = formik.values.rows2.reduce((acc, { amount }) => {
    // Convert lcAmount to string and replace commas
    const amountString = String(amount || 0).replaceAll(',', '')

    // Parse the amount and add to accumulator
    return acc + parseFloat(amountString) || 0
  }, 0)

  const Balance = total - receivedTotal

  // const { lookup, store, valueOf, clear } = useLookup({
  //   endpointId: CurrencyTradingClientRepository.Client.snapshot,
  //   parameters: { _category: 1 }
  // })

  const CashFormik = useFormik({
    // validate: values => {
    //   const type = values.rows && values.rows.every(row => !!row.type)
    //   const amount = values.rows && values.rows.every(row => !!row.amount)

    //   return type && amount
    //     ? {}
    //     : {
    //         rows: Array(values.rows && values.rows.length).fill({
    //           amount: 'field is required',
    //           type: 'field is required'
    //         })
    //       }
    // },
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          seqNo: 1,
          cashAccountId: '',
          cashInvoiceId: null,
          type: '',
          typeName: '',
          ccName: '',
          amount: '',
          ccId: '',
          bankFees: 0,
          receiptRef: ''
        }
      ]
    },
    onSubmit: values => {}
  })
  useEffect(() => {
    initialValues.rows2 = CashFormik.values.rows.map(
      ({ seqNo, type, ccId, bankFees, amount, receiptRef, cashAccountId, ...rest }) => ({
        seqNo,
        type,
        ccId,
        bankFees,
        amount,
        receiptRef,
        cashAccountId
      })
    )

    formik.setFieldValue('rows2', initialValues.rows2)
  }, [CashFormik.values])

  function onReset(e) {
    setInitialValues({
      recordId: null,
      reference: null,
      rows: [
        {
          seqNo: 1,
          currencyId: '',
          fcAmount: '',
          defaultExRate: 0,
          exRate: '',
          lcAmount: '',
          minRate: 0,
          maxRate: 0
        }
      ],
      rows2: [
        {
          seqNo: 1,
          cashAccountId: '',
          cashInvoiceId: null,
          type: '',
          typeName: '',
          ccName: '',
          amount: '',
          ccId: '',
          bankFees: 0,
          receiptRef: ''
        }
      ],
      date: new Date(),
      clientId: null,
      clientName: null,
      clientType: '1',
      firstName: null,
      middleName: null,
      familyName: null,
      fl_firstName: null,
      fl_lastName: null,
      fl_middleName: null,
      fl_familyName: null,
      birth_date: null,
      resident: false,
      profession: null,
      source_of_income: null,
      sponsor: null,
      id_number: null,
      issue_country: null,
      id_type: null,
      expiry_date: null,
      remarks: null,
      purpose_of_exchange: null,
      nationality: null,
      cell_phone: null,
      status: editMode ? null : '1',
      type: -1,
      wip: 1,
      functionId: '3502',
      idNoConfirm: '',
      cellPhoneConfirm: '',
      otp: false
    })

    // CashFormik.setValues()

    return
  }
  async function onSubmit(values) {
    if (
      (!values.idNoConfirm && values.clientId) ||
      (!values.confirmIdNo && !values.clientId && !values.cellPhoneConfirm)
    ) {
      stack({
        Component: ConfirmationOnSubmit,
        props: {
          formik: formik,
          setErrorMessage: setErrorMessage,
          labels: labels
        },
        title: labels.fetch,
        width: 400,
        height: 400
      })
    } else {
      const { record: recordFunctionId } = await getRequest({
        extension: `SY.asmx/getUFU`,
        parameters: `_userId=${userId}&_functionId=${values.functionId}`
      })

      const { dtId } = recordFunctionId

      const { record: cashAccountRecord } = await getRequest({
        extension: `SY.asmx/getUD`,
        parameters: `_userId=${userId}&_key=cashAccountId`
      })

      const clientId = values.clientId || 0

      const payload = {
        header: {
          recordId: values.recordId,
          dtId,
          reference: values.reference,
          status: values.status,
          date: formatDateToApiFunction(values.date),
          functionId: values.functionId,
          plantId: plantId ? plantId : values.plantId,
          clientId,
          cashAccountId: cashAccountRecord.value,
          poeId: values.purpose_of_exchange,
          wip: values.wip,
          amount: String(total || '').replaceAll(',', ''),
          notes: values.remarks
        },
        items: values.rows.map(
          ({ seqNo, currencyId, exRate, defaultExRate, rateCalcMethod, fcAmount, lcAmount, ...rest }) => ({
            seqNo,
            currencyId,
            exRate,
            defaultExRate,
            rateCalcMethod,
            fcAmount: String(fcAmount || '').replaceAll(',', ''),
            lcAmount: lcAmount
          })
        ),
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
          otp: false,
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
        },

        cash:
          CashFormik.values.rows.length > 0 &&
          CashFormik.values.rows.map(({ seqNo, type, ccId, bankFees, amount, receiptRef, cashAccountId, ...rest }) => ({
            seqNo,
            type,
            ccId,
            bankFees,
            amount: String(amount || '').replaceAll(',', ''),
            receiptRef,
            cashAccountId: cashAccountRecord.value
          }))
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
        getData(response.recordId)

        setEditMode(true)
      } else {
        toast.success('Record Edited Successfully')
      }
      invalidate()
    }

    return
  }
  async function fetchClientInfo({ clientId }) {
    try {
      const response = await getRequest({
        extension: RTCLRepository.Client.get,
        parameters: `_clientId=${clientId}`
      })

      // Check if the response status is OK (200)

      const clientInfo = response && response.record
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
    } catch (error) {
      // Handle other errors, such as network issues or exceptions
      console.error('An error occurred:', error.message)
    }
  }

  async function fetchIDInfo({ idNumber }) {
    const response = await getRequest({
      extension: CTCLRepository.IDNumber.get,
      parameters: `_idNo=${idNumber}`
    })

    return response.record
  }
  async function fetchInfoByKey({ key }) {
    const response = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get3,
      parameters: `_key=${key}`
    })

    return response.record
  }

  return (
    <FormShell
      height={400}
      form={formik}
      initialValues={initial}
      initialValues1={initial1}
      form1={CashFormik}
      setEditMode={setEditMode}
      resourceId={35208}
      editMode={editMode}
      disabledSubmit={Balance && true}
    >
      <FormProvider formik={formik} labels={labels} maxAccess={maxAccess}>
        <Grid container sx={{ px: 2 }} gap={3}>
          <FieldSet title='Transaction'>
            <Grid container spacing={4}>
              <Grid item xs={4}>
                <FormField name='reference' Component={CustomTextField} readOnly />
              </Grid>
              <Grid item xs={4}>
                <CustomDatePicker
                  name='date'
                  label={labels.date}
                  value={formik.values?.date}
                  required={true}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('date', '')}
                  readOnly={editMode}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  maxAccess={maxAccess}
                />
                {/* <FormField name='date' Component={CustomDatePicker}  required readOnly={editMode} /> */}
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
                  <FormControlLabel
                    value={'3502'}
                    control={<Radio />}
                    label={labels.purchase}
                    disabled={formik?.values?.rows[0]?.currencyId != '' ? true : false}
                  />
                  <FormControlLabel
                    value={'3503'}
                    control={<Radio />}
                    label={labels.sale}
                    disabled={formik?.values?.rows[0]?.currencyId != '' ? true : false}
                  />
                </RadioGroup>
              </Grid>
              <Grid item xs={4}>
                <RadioGroup row value={formik.values.clientType} onChange={formik.onChange}>
                  <FormControlLabel value={'1'} control={<Radio />} label={labels.individual} />
                  <FormControlLabel value={'2'} control={<Radio />} label={labels.corporate} disabled />
                </RadioGroup>
              </Grid>
              {/* <Grid item xs={4}>{formik.values.clientId}
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
                  setStore={setStore}
                  store={store}
                  value={formik.values.clientId}
                  firstValue={formik.values.clientName}
                  secondDisplayField={false}
                  onLookup={lookup}
                  readOnly={editMode || idInfoAutoFilled}
                />
              </Grid> */}
              <Grid item xs={4}>
                {/* <ResourceLookup
                  endpointId={CurrencyTradingClientRepository.Client.snapshot}
                  parameters={{
                    _category: 1
                  }}
                  valueField='name'
                  displayField='name'
                  name='clientId'
                  valueShow='clientName'
                  label={labels.client}
                  form={formik}
                  readOnly={editMode || idInfoAutoFilled}
                 secondDisplayField={false}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('clientId', newValue?.recordId)
                      formik.setFieldValue('clientName', newValue?.name)
                      fetchClientInfo({ clientId: newValue?.recordId })
                    } else {
                      formik.setFieldValue('clientId', '')
                      formik.setFieldValue('clientName', '')
                    }
                  }}
                  errorCheck={'clientId'}
                /> */}

                <FormField
                  name='search'
                  Component={CustomTextField}
                  onBlur={e => {
                    e.target.value &&
                      fetchInfoByKey({ key: e.target.value })
                        .then(info => {
                          if (info) {
                            setIDInfoAutoFilled(false)

                            formik.setFieldValue('id_number', info.clientIDView.idNo)
                            formik.setFieldValue('firstName', info.clientIndividual.firstName)
                            formik.setFieldValue('clientId', info.clientId)
                            formik.setFieldValue('middleName', info.clientIndividual.middleName)
                            formik.setFieldValue('lastName', info.clientIndividual.lastName)
                            formik.setFieldValue('familyName', info.clientIndividual.familyName)
                            formik.setFieldValue('fl_firstName', info.clientIndividual.fl_firstName)
                            formik.setFieldValue('fl_lastName', info.clientIndividual.fl_lastName)
                            formik.setFieldValue('fl_middleName', info.clientIndividual.fl_middleName)
                            formik.setFieldValue('fl_familyName', info.clientIndividual.fl_familyName)
                            formik.setFieldValue('birth_date', formatDateFromApi(info.clientIndividual.birthDate))
                            formik.setFieldValue('resident', info.clientIndividual.isResident)
                            formik.setFieldValue('profession', info.clientIndividual.professionId)
                            formik.setFieldValue('sponsor', info.clientIndividual.sponsorName)
                            formik.setFieldValue('source_of_income', info.clientIndividual.incomeSourceId)
                            formik.setFieldValue('issue_country', info.clientIDView.idCountryId)
                            formik.setFieldValue('id_type', info.clientIDView.idtId)
                            formik.setFieldValue('nationality', info.clientMaster.nationalityId)
                            formik.setFieldValue('cell_phone', info.clientMaster.cellPhone)
                            formik.setFieldValue('expiry_date', formatDateFromApi(info.clientIDView.idExpiryDate))

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
            </Grid>
          </FieldSet>
          <FieldSet title='Operations'>
            <Grid item xs={12}>
              <InlineEditGrid
                maxAccess={maxAccess}
                gridValidation={formik}
                scrollHeight={350}
                width={1500}
                background={
                  formik.values.functionId && (formik.values.functionId === '3503' ? '#C7F6C7' : 'rgb(245, 194, 193)')
                }
                columns={[
                  {
                    field: 'incremented',
                    header: 'SL#',
                    name: 'seqNo',
                    readOnly: true,
                    hidden: true,
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
                    mandatory: true,
                    columnsInDropDown: [
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ],
                    async onChange(row) {
                      if (row?.newValue > 0) {
                        const exchange = await fetchRate({
                          currencyId: row.newValue
                        })

                        if (!exchange?.rate)
                          stackError({
                            message: `Rate not defined for ${row.value}.`
                          })

                        if (exchange) {
                          const exRate = exchange.rate
                          const rateCalcMethod = exchange.rateCalcMethod

                          const lcAmount =
                            rateCalcMethod === 1
                              ? parseFloat(row.newRowData.fcAmount.toString().replace(/,/g, '')) * exRate
                              : rateCalcMethod === 2
                              ? parseFloat(row.newRowData.fcAmount.toString().replace(/,/g, '')) / exRate
                              : 0
                          formik.setFieldValue(`rows[${row.rowIndex}].lcAmount`, lcAmount)
                        }

                        formik.setFieldValue(`rows[${row.rowIndex}].currencyId`, row.newValue)
                        formik.setFieldValue(`rows[${row.rowIndex}].exRate`, exchange?.rate)
                        formik.setFieldValue(`rows[${row.rowIndex}].defaultExRate`, exchange?.rate)
                        formik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod`, exchange?.rateCalcMethod)
                        formik.setFieldValue(`rows[${row.rowIndex}].minRate`, exchange?.minRate)
                        formik.setFieldValue(`rows[${row.rowIndex}].maxRate`, exchange?.maxRate)

                        //  row.rowData.currencyId = row.newValue
                        //  row.rowData.exRate = exchange.exchangeRate.rate
                        //  row.rowData.rateCalcMethod = exchange.exchange.rateCalcMethod
                      } else {
                        formik.setFieldValue(`rows[${row.rowIndex}].currencyId`, '')
                        formik.setFieldValue(`rows[${row.rowIndex}].exRate`, 0)
                        formik.setFieldValue(`rows[${row.rowIndex}].defaultExRate`, 0)
                        formik.setFieldValue(`rows[${row.rowIndex}].rateCalcMethod`, 0)
                        formik.setFieldValue(`rows[${row.rowIndex}].minRate`, 0)
                        formik.setFieldValue(`rows[${row.rowIndex}].maxRate`, 0)

                        return
                      }

                      //                       if(row.newValue !== formik.values.rows[row.rowIndex].currencyId && formik.values.rows[row.rowIndex].fcAmount){

                      //                         const exRate = formik.values?.rows[row.rowIndex]?.exRate
                      //                         const  rateCalcMethod = formik.values?.rows[row?.rowIndex]?.rateCalcMethod

                      //                         const lcAmount =
                      //                         rateCalcMethod === 1
                      //                           ? parseFloat(newValue.toString().replace(/,/g, '')) * exRate
                      //                           : rateCalcMethod === 2
                      //                           ? parseFloat(newValue.toString().replace(/,/g, '')) / exRate
                      //                           : 0
                      //                       formik.setFieldValue(`rows[${rowIndex}].lcAmount`, lcAmount)

                      // return
                      //                       }
                    }
                  },
                  {
                    field: 'numberfield',
                    header: 'FC Amount',
                    mandatory: true,
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
                    name: 'defaultExRate',
                    readOnly: false,
                    hidden: true
                  },
                  {
                    field: 'numberfield',
                    header: 'Rate',
                    name: 'exRate',
                    readOnly: false,
                    mandatory: true,
                    async onChange(e) {
                      const {
                        rowIndex,
                        rowData: { minRate, maxRate, lcAmount, fcAmount },
                        newValue
                      } = e

                      const nv = parseFloat(newValue?.toString().replace(/,/g, ''))
                      const lc = parseFloat(lcAmount?.toString().replace(/,/g, ''))
                      const fc = parseFloat(fcAmount?.toString().replace(/,/g, ''))

                      if (nv >= minRate && nv <= maxRate) {
                        formik.setFieldValue(`rows[${e.rowIndex}].exRate`, e.value)

                        if (fc) {
                          formik.setFieldValue(`rows[${rowIndex}].lcAmount`, fc * nv)
                        } else if (lc) {
                          formik.setFieldValue(`rows[${e.rowIndex}].fcAmount`, lc / nv)
                        }
                      } else {
                        formik.setFieldValue(`rows[${e.rowIndex}].exRate`, '')
                      }
                    }
                  },

                  {
                    field: 'numberfield',
                    name: 'minRate',
                    readOnly: false,
                    hidden: true
                  },
                  {
                    field: 'numberfield',
                    name: 'maxRate',
                    readOnly: false,
                    hidden: true
                  },
                  {
                    field: 'numberfield',
                    header: 'LC Amount',
                    name: 'lcAmount',
                    mandatory: true,
                    readOnly: false,
                    async onChange(e) {
                      const {
                        rowIndex,
                        rowData: { exRate },
                        newValue
                      } = e
                      if (newValue && exRate) {
                        var fcAmount = String(newValue || 0).replaceAll(',', '')
                        fcAmount = parseFloat(fcAmount) || 0
                        fcAmount = fcAmount / exRate
                        formik.setFieldValue(`rows[${rowIndex}].fcAmount`, fcAmount)
                      }
                    }
                  }
                ]}
                defaultRow={{
                  seqNo: 1,
                  currencyId: '',
                  fcAmount: 0,
                  exRate: 0,
                  lcAmount: 0,
                  minRate: 0,
                  maxRate: 0
                }}
              />
            </Grid>
          </FieldSet>
          <FieldSet title='Individual'>
            <Grid container spacing={4} sx={{ pt: 5 }}>
              <Grid container rowGap={3} xs={4} sx={{ px: 2 }}>
                <Grid item xs={7}>
                  <FormField
                    name='id_number'
                    Component={CustomTextField}
                    onBlur={e => {
                      if (e.target.value != idNumber) {
                        checkTypes(e.target.value)

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
                      }
                    }}
                    onFocus={value => {
                      setIdNumber(value)
                    }}
                    readOnly={editMode}
                    required
                  />
                </Grid>
                <Grid item xs={7}>
                  {/* <FormField
                    name='birth_date'
                    Component={CustomDatePicker}
                    readOnly={editMode || infoAutoFilled}
                    required
                  /> */}

                  <CustomDatePicker
                    name='birth_date'
                    label={labels.birth_date}
                    value={formik.values?.birth_date}
                    required={true}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('birth_date', '')}
                    error={formik.touched.birth_date && Boolean(formik.errors.birth_date)}
                    readOnly={editMode || infoAutoFilled}
                    helperText={formik.touched.birth_date && formik.errors.birth_date}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid container xs={12}>
                  <Grid item xs={7}>
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
                  <Grid item xs={5}>
                    <Button
                      variant='contained'
                      onClick={() =>
                        stack({
                          Component: Confirmation,
                          props: {
                            idTypeStore: idTypeStore,
                            formik: formik,
                            setErrorMessage: setErrorMessage,
                            labels: labels
                          },
                          title: labels.fetch,
                          width: 400,
                          height: 400
                        })
                      }
                      disabled={
                        !formik?.values?.id_type || !formik?.values?.birth_date || !formik.values?.id_number || editMode
                          ? true
                          : false
                      }
                    >
                      {labels.fetch} {formik?.values?.birth_Date}
                    </Button>
                  </Grid>
                </Grid>

                <Grid item xs={7}>
                  {/* <FormField
                    name='expiry_date'
                    Component={CustomDatePicker}
                    readOnly={editMode || idInfoAutoFilled}
                    required
                  /> */}
                  <CustomDatePicker
                    name='expiry_date'
                    label={labels.expiry_date}
                    value={formik.values?.expiry_date}
                    required={true}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('expiry_date', '')}
                    error={formik.touched.expiry_date && Boolean(formik.errors.expiry_date)}
                    helperText={formik.touched.expiry_date && formik.errors.expiry_date}
                    readOnly={editMode || idInfoAutoFilled}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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

                <Grid item xs={12}>
                  <FormField name='cell_phone' Component={CustomTextField} readOnly={editMode} required />
                </Grid>
                <Grid item xs={7}>
                  <FormControlLabel
                    name='resident'
                    checked={formik.values.resident}
                    onChange={formik.handleChange}
                    control={<Checkbox defaultChecked />}
                    label='Resident'
                    readOnly={editMode || infoAutoFilled}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControlLabel
                    name='otp'
                    checked={formik.values.otp}
                    onChange={formik.handleChange}
                    control={<Checkbox defaultChecked />}
                    label='Otp'
                    disabled={true}
                  />
                </Grid>
              </Grid>

              <Grid container rowGap={3} xs={8} sx={{ px: 2, alignContent: 'start' }}>
                <Grid xs={12} container spacing={2}>
                  <Grid item xs={3}>
                    <FormField
                      name='firstName'
                      Component={CustomTextField}
                      readOnly={editMode || infoAutoFilled}
                      required
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField name='middleName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField
                      name='lastName'
                      Component={CustomTextField}
                      readOnly={editMode || infoAutoFilled}
                      required
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField name='familyName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
                  </Grid>
                </Grid>
                <Grid xs={12} container spacing={2} sx={{ flexDirection: 'row-reverse' }}>
                  <Grid item xs={3}>
                    <FormField name='fl_firstName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField name='fl_middleName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField name='fl_lastName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField name='fl_familyName' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
                  </Grid>
                </Grid>
                <Grid container rowGap={3} xs={4}></Grid>

                <Grid container rowGap={3} xs={8}>
                  <Grid item xs={12}>
                    <FormField name='sponsor' Component={CustomTextField} readOnly={editMode || infoAutoFilled} />
                  </Grid>

                  <Grid item xs={12}>
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

                  <Grid item xs={12}>
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

                  <Grid item xs={12}>
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

                  <Grid item xs={12}>
                    <FormField name='remarks' Component={CustomTextField} readOnly={editMode} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title='Amount'>
            <Grid container xs={12} spacing={4}>
              <Grid item xs={9} spacing={4}>
                <InlineEditGrid
                  maxAccess={maxAccess}
                  gridValidation={CashFormik}
                  scrollHeight={350}
                  width={850}
                  columns={[
                    {
                      field: 'incremented',
                      header: 'SL#',
                      name: 'seqNo',
                      hidden: true,
                      readOnly: true,
                      valueSetter: () => {
                        return CashFormik.values.rows.length + 1
                      }
                    },
                    {
                      field: 'combobox',
                      valueField: 'key',
                      displayField: 'value',
                      header: labels.type,
                      nameId: 'type',
                      name: 'typeName',
                      store: typeStore,
                      mandatory: true,
                      widthDropDown: '300',
                      columnsInDropDown: [{ key: 'value', value: 'Value' }]
                    },
                    {
                      field: 'numberfield',
                      header: 'Amount',
                      name: 'amount',
                      mandatory: true,
                      required: true,
                      readOnly: false
                    },

                    {
                      field: 'combobox',
                      valueField: 'recordId',
                      displayField: 'name',
                      header: labels.creditCard,
                      nameId: 'ccId',
                      name: 'ccName',
                      store: creditCardStore,
                      widthDropDown: '300',
                      columnsInDropDown: [
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'name' }
                      ]
                    },
                    {
                      field: 'numberfield',
                      header: labels.BanKFees,
                      name: 'bankFees'
                    },
                    {
                      field: 'textfield',
                      header: labels.receiptRef,
                      name: 'receiptRef'
                    }
                  ]}
                  defaultRow={{
                    seqNo: 0,
                    cashAccountId: '',
                    cashInvoiceId: null,
                    type: '',
                    typeName: '',
                    ccName: '',
                    amount: 0,
                    ccId: '',
                    bankFees: 0,
                    receiptRef: ''
                  }}
                />
              </Grid>

              <Grid container xs={3} spacing={2} sx={{ p: 4 }}>
                <Grid item xs={12}>
                  <CustomTextField label='Net Amount' value={getFormattedNumber(total)} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField label='Amount Recieved' value={getFormattedNumber(receivedTotal)} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField label='Balance To Pay' value={getFormattedNumber(Balance) ?? '0'} readOnly />
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
        </Grid>
      </FormProvider>
    </FormShell>
  )
}
