import { Button, Checkbox, FormControlLabel, Grid, Radio, RadioGroup } from '@mui/material'
import dayjs from 'dayjs'
import { useFormik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import Confirmation from 'src/components/Shared/Confirmation'
import FieldSet from 'src/components/Shared/FieldSet'

import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useError } from 'src/error'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { CommonContext } from 'src/providers/CommonContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
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
import FormShell from 'src/components/Shared/FormShell'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'

const FormContext = React.createContext(null)

export async function Country(getRequest) {
  var parameters = `_filter=&_key=countryId`

  const res = await getRequest({
    extension: SystemRepository.Defaults.get,
    parameters: parameters
  })

  return res.record.value
}

function FormField({ type, name, Component, valueField, onFocus, language, ...rest }) {
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
        type,
        name,
        label: labels[name],
        values: formik.values,
        value: formik.values[name],
        error: formik.errors[name],
        errors: formik.errors,
        valueField: valueField,
        language: language
      }}
      onChange={(e, v) => {
        if (name === 'id_type' && v && v['type'] && (v['type'] === 1 || v['type'] === 2)) {
          getCountry()
        }
        formik.setFieldValue(name, v ? v[valueField] ?? v : e.target.value)
      }}
      onFocus={e => {
        if (onFocus && (name == 'id_number' || name == 'search')) {
          onFocus(e.target.value)
        }
        if (onFocus && name == 'cell_phone') {
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
  const [idNumberOne, setIdNumber] = useState(null)
  const [search, setSearch] = useState(null)
  const [isClosed, setIsClosed] = useState(false)

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
    endpointId: CTTRXrepository.CurrencyTrading.snapshot
  })

  const initial = {
    recordId: null,
    reference: null,
    operations: [
      {
        id: 1,
        currencyId: '',
        fcAmount: '',
        defaultRate: '',
        exRate: '',
        lcAmount: '',
        minRate: '',
        maxRate: ''
      }
    ],
    amount: [
      {
        id: 1,
        cashAccountId: '',
        cashInvoiceId: null,
        type: '',
        typeName: '',
        ccName: '',
        amount: '',
        ccId: '',
        bankFees: '',
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
    otp: false,
    search: null
  }

  const [initialValues, setInitialValues] = useState(initial)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
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
      profession: yup.string().required(),
      operations: yup
        .array()
        .of(
          yup.object().shape({
            currency: yup
              .object()
              .shape({
                recordId: yup.string().required('Currency recordId is required')
              })
              .required('Currency is required'),
            exRate: yup.string().nullable().required('Rate is required'),
            fcAmount: yup.string().required('FcAmount is required'),
            lcAmount: yup.string().required('LcAmount is required')
          })
        )
        .required('Operations array is required'),
      amount: yup
        .array()
        .of(
          yup.object().shape({
            types: yup
              .object()
              .shape({
                key: yup.string().required('Currency recordId is required')
              })
              .required('Currency is required'),
            amount: yup.string().nullable().required('amount is required')
          })
        )
        .required('Operations array is required')
    }),

    initialValues,
    onSubmit
  })

  async function setOperationType(type) {
    if (type === '3502' || type === '3503') {
      const res = await getRequest({
        extension: 'SY.asmx/getDE',
        parameters:
          type === '3502'
            ? '_key=ct_cash_purchase_ratetype_id'
            : type === '3503'
            ? '_key=ct_cash_sales_ratetype_id'
            : ''
      })
      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
    }
  }

  const [currencyStore, setCurrencyStore] = useState([])
  const [showAsPasswordIDNumber, setShowAsPasswordIDNumber] = useState(false)
  const [showAsPasswordPhone, setShowAsPasswordPhone] = useState(false)

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
      setOperationType(record.headerView.functionId)

      formik.setValues({
        recordId: _recordId,
        reference: record.headerView.reference,
        operations: record.items.map(
          ({ seqNo, currencyId, currencyName, currencyRef, lcAmount, fcAmount, minRate, maxRate, ...rest }) => ({
            id: seqNo,
            currencyId: currencyId,
            currency: {
              recordId: currencyId,
              name: currencyName,
              reference: currencyRef
            },
            lcAmount: getFormattedNumber(lcAmount),
            fcAmount: getFormattedNumber(fcAmount),
            minRate,
            maxRate,
            ...rest
          })
        ),
        amount: record.cash.map(({ seqNo, amount, type, typeName, ccId, ccName, ...rest }) => ({
          id: seqNo,
          types: {
            key: type,
            value: typeName
          },
          creditCards: {
            recordId: ccId,
            name: ccName
          },
          amount: getFormattedNumber(amount),
          ...rest
        })),
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
    }
    setIsClosed(record.headerView.wip === 2 ? true : false)
  }

  const { userId } = JSON.parse(window.sessionStorage.getItem('userData'))

  async function fetchRate({ currencyId }) {
    if (currencyId) {
      const result = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_key=baseCurrencyId`
      })

      const response = await getRequest({
        extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
        parameters: `_plantId=${
          plantId ? plantId : formik.values.plantId
        }&_currencyId=${currencyId}&_rateTypeId=${rateType}&_racurrencyId=${result.record.value}`
      })

      return response.record
    }
  }

  const onClose = async () => {
    const values = formik.values

    const { record: cashAccountRecord } = await getRequest({
      extension: `SY.asmx/getUD`,
      parameters: `_userId=${userId}&_key=cashAccountId`
    })

    const data = {
      recordId: values?.recordId || null,
      status: values.status,
      functionId: values.functionId,
      plantId: plantId ? plantId : values.plantId,
      clientId: values.clientId,
      cashAccountId: cashAccountRecord.value,
      poeId: values.purpose_of_exchange,
      wip: values.wip,
      otpVerified: values.otp,
      amount: String(total || '').replaceAll(',', ''),
      notes: values.remarks
    }

    const res = await postRequest({
      extension: CTTRXrepository.CurrencyTrading.close,
      record: JSON.stringify(data)
    })
    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(true)
    }
  }

  async function onReopen() {
    const values = formik.values

    const { record: cashAccountRecord } = await getRequest({
      extension: `SY.asmx/getUD`,
      parameters: `_userId=${userId}&_key=cashAccountId`
    })

    const data = {
      recordId: values?.recordId || null,
      date: formatDateToApiFunction(values.date),
      reference: values.reference,
      status: values.status,
      functionId: values.functionId,
      plantId: plantId ? plantId : values.plantId,
      clientId: values.clientId,
      cashAccountId: cashAccountRecord.value,
      poeId: values.purpose_of_exchange,
      wip: values.wip,
      otpVerified: values.otp,
      amount: String(total || '').replaceAll(',', ''),
      notes: values.remarks
    }

    const res = await postRequest({
      extension: CTTRXrepository.CurrencyTrading.reopen,
      record: JSON.stringify(data)
    })
    if (res.recordId) {
      toast.success('Record Reopened Successfully')
      invalidate()
      setIsClosed(false)
    }
  }

  const total = formik.values.operations.reduce((acc, { lcAmount }) => {
    return acc + lcAmount
  }, 0)

  const receivedTotal = formik.values.amount.reduce((acc, { amount }) => {
    return acc + amount
  }, 0)

  const Balance = total - receivedTotal
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
          recordId: values?.recordId || null,
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
        items: values.operations.map(
          ({ id, currencyId, exRate, defaultRate, minRate, maxRate, rateCalcMethod, fcAmount, lcAmount, ...rest }) => ({
            seqNo: id,
            currencyId,
            exRate,
            defaultRate,
            rateCalcMethod,
            minRate,
            maxRate,
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
          formik.values.amount.length > 0 &&
          formik.values.amount.map(
            ({ id, types, creditCards, bankFees, amount, receiptRef, cashAccountId, ...rest }) => ({
              seqNo: id,

              type: types.key,

              ccId: creditCards.recordId,
              bankFees,
              amount: String(amount || '').replaceAll(',', ''),
              receiptRef,
              cashAccountId: cashAccountRecord.value
            })
          )
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
      setInfoAutoFilled(false)
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

  // function onClose (){

  // }

  // function onReopen() {

  // }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || formik.values.releaseStatus === 3
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  return (
    <FormShell
      actions={actions}
      height={400}
      form={formik}
      initialValues={initial}
      setEditMode={setEditMode}
      setIDInfoAutoFilled={setIDInfoAutoFilled}
      resourceId={35208}
      editMode={editMode}
      isClosed={isClosed}
      disabledSubmit={Balance && true}
      previewReport={editMode}
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
                  readOnly={editMode || isClosed}
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
                    disabled={formik?.values?.operations[0]?.currencyId != '' ? true : false}
                  />
                  <FormControlLabel
                    value={'3503'}
                    control={<Radio />}
                    label={labels.sale}
                    disabled={formik?.values?.operations[0]?.currencyId != '' ? true : false}
                  />
                </RadioGroup>
              </Grid>
              <Grid item xs={4}>
                <RadioGroup row value={formik.values.clientType} onChange={formik.onChange}>
                  <FormControlLabel value={'1'} control={<Radio />} label={labels.individual} />
                  <FormControlLabel value={'2'} control={<Radio />} label={labels.corporate} disabled />
                </RadioGroup>
              </Grid>

              <Grid item xs={4}>
                <FormField
                  name='search'
                  Component={CustomTextField}
                  onBlur={e => {
                    e.target.value &&
                      search != e.target.value &&
                      fetchInfoByKey({ key: e.target.value })
                        .then(info => {
                          if (!!info) {
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
                            formik.setFieldValue('cell_phone', parseInt(info.clientMaster.cellPhone))
                            formik.setFieldValue('expiry_date', formatDateFromApi(info.clientIDView.idExpiryDate))

                            setIDInfoAutoFilled(true)
                          }
                        })
                        .catch(error => {
                          console.error('Error fetching ID info:', error)
                        })
                  }}
                  readOnly={editMode || isClosed}
                  onFocus={value => {
                    setSearch(value)
                  }}
                  required
                />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title='Operations'>
            <Grid width={'100%'}>
              <DataGrid
                onChange={value => formik.setFieldValue('operations', value)}
                value={formik.values.operations}
                error={formik.errors.operations}
                height={300}
                disabled={isClosed}
                bg={
                  formik.values.functionId &&
                  (parseInt(formik.values.functionId) === 3503 ? '#C7F6C7' : 'rgb(245, 194, 193)')
                }
                columns={[
                  {
                    component: 'resourcecombobox',
                    label: labels.currency,
                    name: 'currency',
                    props: {
                      endpointId: SystemRepository.Currency.qry,
                      displayField: ['reference', 'name'],
                      valueField: 'recordId',
                      columnsInDropDown: [
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]
                    },
                    async onChange({ row: { update, oldRow, newRow } }) {
                      if (!newRow?.currency?.recordId) {
                        return
                      }
                      const exchange = await fetchRate({ currencyId: newRow?.currency?.recordId })
                      if (!exchange?.rate) {
                        stackError({
                          message: `Rate not defined for ${newRow.currency.name}.`
                        })

                        return
                      }
                      if (exchange && newRow.fcAmount) {
                        const exRate = exchange.rate
                        const rateCalcMethod = exchange.rateCalcMethod

                        const lcAmount =
                          rateCalcMethod === 1
                            ? parseFloat(newRow.fcAmount.toString().replace(/,/g, '')) * exRate
                            : rateCalcMethod === 2
                            ? parseFloat(newRow.fcAmount.toString().replace(/,/g, '')) / exRate
                            : 0

                        exchange.rate && update({ lcAmount: lcAmount })
                      }

                      update({
                        currencyId: newRow.currency.recordId,
                        exRate: exchange?.rate,
                        defaultRate: exchange?.rate,
                        rateCalcMethod: exchange?.rateCalcMethod,
                        minRate: exchange?.minRate,
                        maxRate: exchange?.maxRate
                      })
                    },

                    flex: 1.5
                  },
                  {
                    component: 'numberfield',
                    label: labels.fcAmount,
                    name: 'fcAmount',
                    async onChange({ row: { update, newRow } }) {
                      const fcAmount = parseFloat(newRow.fcAmount?.toString().replace(/,/g, ''))
                      !isNaN(fcAmount) &&
                        update({
                          lcAmount: newRow.exRate * fcAmount
                        })
                    },
                    defaultValue: ''
                  },
                  {
                    component: 'numberfield',
                    name: 'exRate',
                    label: labels.Rate,
                    props: {
                      readOnly: false
                    },
                    async onChange({ row: { update, newRow } }) {
                      const fcAmount = parseFloat(newRow.fcAmount?.toString().replace(/,/g, ''))

                      if (newRow.exRate >= newRow.minRate && newRow.exRate <= newRow.maxRate) {
                        !isNaN(newRow.exRate * fcAmount) &&
                          update({
                            lcAmount: newRow.exRate * fcAmount
                          })
                      } else {
                        stackError({
                          message: `Rate not in the [${newRow.minRate}-${newRow.maxRate}]range.`
                        })
                        update({
                          exRate: ''
                        })

                        return
                      }
                    },

                    defaultValue: ''
                  },
                  {
                    component: 'numberfield',
                    name: 'lcAmount',
                    label: labels.lcAmount,
                    props: {
                      readOnly: false
                    },
                    async onChange({ row: { update, newRow } }) {
                      const lcAmount = parseFloat(newRow.lcAmount?.toString().replace(/,/g, ''))
                      const fcAmount = lcAmount ? lcAmount / newRow.exRate : ''
                      if (fcAmount && newRow.exRate)
                        update({
                          fcAmount: fcAmount
                        })
                    },

                    defaultValue: ''
                  }
                ]}
              />
            </Grid>
          </FieldSet>
          <FieldSet title='Individual'>
            <Grid container spacing={4} sx={{ pt: 5 }}>
              <Grid container rowGap={3} xs={4} sx={{ px: 2 }}>
                <Grid item xs={7}>
                  <FormField
                    name='id_number'
                    type={showAsPasswordIDNumber && formik.values['id_number'] ? 'password' : 'text'}
                    Component={CustomTextField}
                    onBlur={e => {
                      setShowAsPasswordIDNumber(true)

                      if (e.target.value && e.target.value != idNumberOne) {
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
                            }
                          })
                          .catch(error => {
                            console.error('Error fetching ID info:', error)
                          })
                      }
                    }}
                    onFocus={value => {
                      setShowAsPasswordIDNumber(false)
                      value && setIdNumber(value)
                    }}
                    readOnly={editMode || isClosed || idInfoAutoFilled}
                    required
                  />
                </Grid>
                <Grid item xs={7}>
                  <CustomDatePicker
                    name='birth_date'
                    label={labels.birth_date}
                    value={formik.values?.birth_date}
                    required={true}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('birth_date', '')}
                    error={formik.touched.birth_date && Boolean(formik.errors.birth_date)}
                    readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
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
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
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
                        !formik?.values?.id_type ||
                        !formik?.values?.birth_date ||
                        !formik.values?.id_number ||
                        editMode ||
                        isClosed
                          ? true
                          : false
                      }
                    >
                      {labels.fetch} {formik?.values?.birth_Date}
                    </Button>
                  </Grid>
                </Grid>

                <Grid item xs={7}>
                  <CustomDatePicker
                    name='expiry_date'
                    label={labels.expiry_date}
                    value={formik.values?.expiry_date}
                    required={true}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('expiry_date', '')}
                    error={formik.touched.expiry_date && Boolean(formik.errors.expiry_date)}
                    readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
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
                    readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
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
                    readOnly={editMode || isClosed || idInfoAutoFilled}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormField
                    type={showAsPasswordPhone && formik.values['cell_phone'] ? 'password' : 'text'}
                    name='cell_phone'
                    Component={CustomTextField}
                    required
                    readOnly={editMode || isClosed || idInfoAutoFilled}
                    onBlur={e => {
                      setShowAsPasswordPhone(true)
                    }}
                    onFocus={value => {
                      setShowAsPasswordPhone(false)
                    }}
                  />
                </Grid>
                <Grid item xs={7}>
                  <FormControlLabel
                    name='resident'
                    checked={formik.values.resident}
                    onChange={formik.handleChange}
                    control={<Checkbox defaultChecked />}
                    label='Resident'
                    disabled={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
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
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                      required
                      language='english'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField
                      name='middleName'
                      language='english'
                      Component={CustomTextField}
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField
                      name='lastName'
                      Component={CustomTextField}
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                      required
                      language='english'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField
                      name='familyName'
                      language='english'
                      Component={CustomTextField}
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                    />
                  </Grid>
                </Grid>
                <Grid xs={12} container spacing={2} sx={{ flexDirection: 'row-reverse' }}>
                  <Grid item xs={3}>
                    <FormField
                      name='fl_firstName'
                      Component={CustomTextField}
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                      language='arabic'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField
                      name='fl_middleName'
                      Component={CustomTextField}
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                      language='arabic'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField
                      name='fl_lastName'
                      Component={CustomTextField}
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormField
                      name='fl_familyName'
                      Component={CustomTextField}
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                      language='arabic'
                    />
                  </Grid>
                </Grid>
                <Grid container rowGap={3} xs={4}></Grid>

                <Grid container rowGap={3} xs={8}>
                  <Grid item xs={12}>
                    <FormField name='sponsor' Component={CustomTextField} readOnly={editMode || isClosed} />
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
                      readOnly={editMode || isClosed}
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
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
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
                      readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormField name='remarks' Component={CustomTextField} readOnly={editMode || isClosed} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title='Amount'>
            <Grid container xs={12} spacing={4}>
              <Grid item xs={9} spacing={4}>
                <Grid container xs={12} spacing={4}>
                  <Grid width={'100%'}>
                    <DataGrid
                      onChange={value => formik.setFieldValue('amount', value)}
                      value={formik.values.amount}
                      error={formik.errors.amount}
                      disabled={isClosed}
                      columns={[
                        {
                          component: 'resourcecombobox',
                          label: labels.type,
                          name: 'types',
                          props: {
                            datasetId: DataSets.CA_CASH_ACCOUNT_TYPE,
                            displayField: 'value',
                            valueField: 'key',
                            filter: item => (formik.values.functionId === '3502' ? item.key === '2' : true)
                          }
                        },
                        {
                          component: 'numberfield',
                          name: 'amount',
                          async onChange({ row: { update, newRow } }) {
                            update({
                              lcAmount: newRow.exRate * newRow.fcAmount
                            })
                          },
                          defaultValue: ''
                        },
                        {
                          component: 'resourcecombobox',
                          name: 'creditCards',
                          editable: false,
                          label: labels.creditCard,
                          props: {
                            endpointId: CashBankRepository.CreditCard.qry,
                            valueField: 'recordId',
                            displayField: 'name'
                          }
                        },
                        {
                          component: 'numberfield',
                          header: labels.receiptRef,
                          name: 'bankFees',
                          label: labels.BanKFees
                        },
                        {
                          component: 'numberfield',
                          header: labels.receiptRef,
                          name: 'receiptRef',
                          label: labels.receiptRef
                        }
                      ]}
                    />
                  </Grid>
                </Grid>
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
