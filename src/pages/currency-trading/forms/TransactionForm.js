import { Button, Checkbox, FormControlLabel, Grid, Radio, RadioGroup } from '@mui/material'
import { useFormik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import Confirmation from 'src/components/Shared/Confirmation'
import FieldSet from 'src/components/Shared/FieldSet'
import { SystemFunction } from 'src/resources/SystemFunction'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useError } from 'src/error'
import { formatDateFromApi, formatDateToApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import * as yup from 'yup'
import { DataSets } from 'src/resources/DataSets'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import useIdType from 'src/hooks/useIdType'
import { useInvalidate } from 'src/hooks/resource'
import ConfirmationOnSubmit from 'src/pages/currency-trading/forms/ConfirmationOnSubmit'
import FormShell from 'src/components/Shared/FormShell'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import FormGrid from 'src/components/form/layout/FormGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const FormContext = React.createContext(null)

export async function Country(getRequest) {
  var parameters = `_filter=&_key=countryId`

  const res = await getRequest({
    extension: SystemRepository.Defaults.get,
    parameters: parameters
  })

  return res.record.value
}

function FormField({ type, name, Component, valueField, onFocus, language, phone, ...rest }) {
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
        error: formik.touched[name] && formik.errors[name],
        errors: formik.errors,
        valueField: valueField,
        language: language,
        phone: phone
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

export default function TransactionForm({ recordId, labels, access, plantId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [editMode, setEditMode] = useState(!!recordId)
  const [infoAutoFilled, setInfoAutoFilled] = useState(false)
  const [idInfoAutoFilled, setIDInfoAutoFilled] = useState(false)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const [idTypeStore, setIdTypeStore] = useState([])
  const [getValue] = useIdType()
  const [rateType, setRateType] = useState(null)
  const [idNumberOne, setIdNumber] = useState(null)
  const [search, setSearch] = useState(null)
  const [isClosed, setIsClosed] = useState(false)
  const [fId, setFId] = useState(SystemFunction.CurrencyPurchase)
  const [isPosted, setIsPosted] = useState(false)

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

  const initialValues = {
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
    functionId: !editMode && SystemFunction.CurrencyPurchase,
    idNoConfirm: '',
    cellPhoneConfirm: '',
    otp: false,
    search: null
  }

  const { maxAccess } = useDocumentType({
    functionId: fId,
    access: access,
    hasDT: false,
    enabled: !editMode
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      date: yup.string().required(' '),
      id_type: yup.number().required(' '),
      id_number: yup.number().required(' '),
      birth_date: yup.string().required(' '),
      firstName: yup.string().required(' '),
      lastName: yup.string().required(' '),
      expiry_date: yup.string().required(' '),
      issue_country: yup.string().required(' '),
      nationality: yup.string().required(' '),
      cell_phone: yup.string().required(' '),
      profession: yup.string().required(' '),
      operations: yup
        .array()
        .of(
          yup.object().shape({
            currencyId: yup.string().required(' '),
            exRate: yup.string().nullable().required(' '),
            fcAmount: yup.number().required(' '),
            lcAmount: yup.number().required(' ')
          })
        )
        .required(' '),
      amount: yup
        .array()
        .of(
          yup.object().shape({
            type: yup.string().required(' '),
            amount: yup.number().nullable().required(' ')
          })
        )
        .required(' ')
    }),
    onSubmit
  })

  async function setOperationType(type) {
    if (type) {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters:
          type === SystemFunction.CurrencyPurchase
            ? '_key=ct_cash_purchase_ratetype_id'
            : type === SystemFunction.CurrencySale
            ? '_key=ct_cash_sales_ratetype_id'
            : ''
      })

      setRateType(res.record.value)
      formik.setFieldValue('functionId', type)
    }
  }

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
      .catch(error => {})
  }

  useEffect(() => {
    fillType()
    ;(async function () {
      setEditMode(false)
      setOperationType(formik.values.functionId)
      if (recordId) {
        setEditMode(true)
        getData(recordId)
      }
    })()
  }, [])

  function getData(id) {
    const _recordId = recordId ? recordId : id

    getRequest({
      extension: CTTRXrepository.CurrencyTrading.get2,
      parameters: `_recordId=${_recordId}`
    })
      .then(res => {
        const record = res.record
        if (!recordId) {
          formik.setFieldValue('reference', record.headerView.reference)
          formik.setFieldValue('recordId', record.headerView.recordId)
        } else {
          formik.setValues({
            recordId: _recordId,
            reference: record.headerView.reference,
            operations: record.items.map(({ seqNo, ...rest }) => ({
              id: seqNo,
              ...rest
            })),
            amount: record.cash.map(({ seqNo, ...rest }) => ({
              id: seqNo,
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
            status: record.headerView.status,
            cashAccountId: record.headerView.cashAccountId
          })

          setOperationType(record.headerView.functionId)
        }
        setIsClosed(record.headerView.wip === 2 ? true : false)
        setIsPosted(record.headerView.status === 4 ? false : true)
      })
      .catch(error => {})
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
    try {
      const values = formik.values

      const data = {
        recordId: values?.recordId || null,
        reference: values.reference,
        status: values.status,
        functionId: values.functionId,
        plantId: plantId ? plantId : values.plantId,
        clientId: values.clientId,
        cashAccountId: values?.cashAccountId,
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
    } catch (e) {}
  }

  async function onReopen() {
    try {
      const values = formik.values

      const { record: cashAccountRecord } = await getRequest({
        extension: SystemRepository.UserDefaults.get,
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
    } catch (e) {}
  }

  const total = formik.values.operations.reduce((acc, { lcAmount }) => {
    return acc + (lcAmount || 0)
  }, 0)

  const receivedTotal = formik.values.amount.reduce((acc, { amount }) => {
    return acc + (amount || 0)
  }, 0)

  const balance = total - receivedTotal

  async function onSubmit(values) {
    try {
      if (
        ((!values?.idNoConfirm && values?.clientId) ||
          (!values?.confirmIdNo && !values?.clientId && !values.cellPhoneConfirm)) &&
        !editMode
      ) {
        stack({
          Component: ConfirmationOnSubmit,
          props: {
            formik: formik,
            labels: labels
          },
          title: labels.fetch,
          width: 400,
          height: 400
        })
      } else {
        const { record: recordFunctionId } = await getRequest({
          extension: SystemRepository.UserFunction.get,
          parameters: `_userId=${userId}&_functionId=${values.functionId}`
        })

        const { dtId } = recordFunctionId

        const { record: cashAccountRecord } = await getRequest({
          extension: SystemRepository.UserDefaults.get,
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
            amount: total,
            notes: values.remarks
          },
          items: values.operations.map(({ id, ...rest }) => ({
            seqNo: id,
            ...rest
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
            formik.values.amount.map(({ id, types, cashAccountId, ...rest }) => ({
              seqNo: id,
              cashAccountId: cashAccountRecord.value,
              ...rest
            }))
        }

        const response = await postRequest({
          extension: CTTRXrepository.CurrencyTrading.set2,
          record: JSON.stringify(payload)
        })

        if (!values.recordId) {
          toast.success('Record Added Successfully')
          formik.setFieldTouched(recordId, response.recordId)
          getData(response.recordId)

          setEditMode(true)
        } else {
          toast.success('Record Edited Successfully')
        }
        invalidate()
      }

      return
    } catch (e) {}
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
        formik.setFieldValue('clientId', clientInfo.clientId)
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

  const onPost = async () => {
    try {
      const values = formik.values
      const data = {
        recordId: values?.recordId || null,
        date: formatDateToApiFunction(values.date),
        reference: values.reference,
        status: values.status,
        functionId: values.functionId,
        plantId: plantId ? plantId : values.plantId,
        clientId: values.clientId,
        cashAccountId: values.cashAccountId,
        poeId: values.purpose_of_exchange,
        wip: values.wip,
        otpVerified: values.otp,
        amount: String(total || '').replaceAll(',', ''),
        notes: values.remarks
      }
      const res = await postRequest({
        extension: CTTRXrepository.CurrencyTrading.post,
        record: JSON.stringify(data)
      })

      if (res) {
        toast.success('Record Posted Successfully')
        setIsPosted(true)
        invalidate()
      }
    } catch (e) {}
  }
  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted || !isClosed
    },
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
      form={formik}
      initialValues={initialValues}
      setEditMode={setEditMode}
      setIDInfoAutoFilled={setIDInfoAutoFilled}
      resourceId={ResourceIds.CashInvoice}
      editMode={editMode}
      isClosed={isClosed}
      disabledSubmit={balance && true}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <FormProvider formik={formik} labels={labels} maxAccess={maxAccess}>
            <Grid container>
              <FieldSet title='Transaction'>
                <Grid container spacing={4}>
                  <Grid item xs={4}>
                    <FormField name='reference' maxAccess={maxAccess} Component={CustomTextField} readOnly={editMode} />
                  </Grid>
                  <FormGrid hideonempty item xs={4}>
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
                  </FormGrid>
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
                    <RadioGroup
                      row
                      value={formik.values.functionId}
                      onChange={e => {
                        setOperationType(parseInt(e.target.value))
                        setFId(e.target.value)
                        formik.setFieldValue('reference', '')
                      }}
                    >
                      <FormControlLabel
                        value={SystemFunction.CurrencyPurchase}
                        control={<Radio />}
                        label={labels.purchase}
                        disabled={formik?.values?.operations[0]?.currencyId != '' ? true : false}
                      />
                      <FormControlLabel
                        value={SystemFunction.CurrencySale}
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
                                formik.setFieldValue('cell_phone', info.clientMaster.cellPhone)
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
                    maxAccess={maxAccess}
                    name='operations'
                    bg={
                      formik.values.functionId &&
                      (parseInt(formik.values.functionId) === SystemFunction.CurrencySale
                        ? '#C7F6C7'
                        : 'rgb(245, 194, 193)')
                    }
                    columns={[
                      {
                        component: 'resourcecombobox',
                        label: labels.currency,
                        name: 'currencyId',
                        props: {
                          endpointId: SystemRepository.Currency.qry,
                          displayField: ['reference', 'name'],
                          valueField: 'recordId',
                          mapping: [
                            { from: 'recordId', to: 'currencyId' },
                            { from: 'name', to: 'currencyName' },
                            { from: 'reference', to: 'currencyRef' }
                          ],
                          columnsInDropDown: [
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' }
                          ]
                        },
                        async onChange({ row: { update, oldRow, newRow } }) {
                          if (!newRow?.currencyId) {
                            update({
                              currencyId: '',
                              exRate: '',
                              defaultRate: '',
                              rateCalcMethod: '',
                              minRate: '',
                              maxRate: ''
                            })

                            return
                          }
                          const exchange = await fetchRate({ currencyId: newRow?.currencyId })
                          if (!exchange?.rate) {
                            update({
                              currencyId: '',
                              exRate: '',
                              defaultRate: '',
                              rateCalcMethod: '',
                              minRate: '',
                              maxRate: ''
                            })
                            stackError({
                              message: `Rate not defined for ${newRow.currencyName}.`
                            })

                            return
                          }
                          if (exchange && newRow.fcAmount) {
                            const exRate = exchange.rate
                            const rateCalcMethod = exchange.rateCalcMethod

                            const lcAmount =
                              rateCalcMethod === 1
                                ? newRow.fcAmount * exRate
                                : rateCalcMethod === 2
                                ? newRow.fcAmount / exRate
                                : 0

                            exchange.rate && update({ lcAmount: lcAmount })
                          }

                          update({
                            currencyId: newRow.currencyId,
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
                          const fcAmount = newRow.fcAmount
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
                        updateOn: 'blur',
                        async onChange({ row: { update, newRow } }) {
                          const fcAmount = newRow.fcAmount
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
                          const lcAmount = newRow.lcAmount
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
                              .catch(error => {})
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
                        phone={true}
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
                          endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
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
                          endpointId={RemittanceSettingsRepository.SourceOfIncome.qry}
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
                          endpointId={RemittanceSettingsRepository.Profession.qry}
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
                          height={200}
                          onChange={value => formik.setFieldValue('amount', value)}
                          value={formik.values.amount}
                          error={formik.errors.amount}
                          disabled={isClosed}
                          columns={[
                            {
                              component: 'resourcecombobox',
                              label: labels.type,
                              name: 'type',
                              props: {
                                datasetId: DataSets.CA_CASH_ACCOUNT_TYPE,
                                displayField: 'value',
                                valueField: 'key',
                                mapping: [
                                  { from: 'key', to: 'type' },
                                  { from: 'value', to: 'typeName' }
                                ],
                                filter: item =>
                                  formik.values.functionId === SystemFunction.CurrencyPurchase ? item.key === '2' : true
                              }
                            },
                            {
                              component: 'numberfield',
                              name: 'amount',
                              label: labels.amount
                            },
                            {
                              component: 'resourcecombobox',
                              name: 'creditCards',
                              editable: false,
                              label: labels.creditCard,
                              props: {
                                endpointId: CashBankRepository.CreditCard.qry,
                                valueField: 'recordId',
                                displayField: 'name',
                                mapping: [
                                  { from: 'recordId', to: 'ccId' },
                                  { from: 'name', to: 'ccName' }
                                ]
                              }
                            },
                            {
                              component: 'numberfield',
                              label: labels.receiptRef,
                              name: 'bankFees'
                            },
                            {
                              component: 'numberfield',
                              label: labels.receiptRef,
                              name: 'receiptRef'
                            }
                          ]}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid container xs={3} spacing={2} sx={{ p: 4 }}>
                    <Grid item xs={12}>
                      <CustomNumberField label={labels.netAmount} value={total} readOnly />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField label={labels.amountReceived} value={receivedTotal} readOnly />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        format={value => (value === 0 ? '0.00' : value)}
                        label={labels.balanceToPay}
                        value={balance}
                        readOnly
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
          </FormProvider>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
