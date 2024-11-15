import { Button, Checkbox, FormControlLabel, Grid, Radio, RadioGroup } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import Confirmation from 'src/components/Shared/Confirmation'
import FieldSet from 'src/components/Shared/FieldSet'
import { SystemFunction } from 'src/resources/SystemFunction'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useError } from 'src/error'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import * as yup from 'yup'
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
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { ControlContext } from 'src/providers/ControlContext'
import CustomDatePickerHijri from 'src/components/Inputs/CustomDatePickerHijri'
import PaymentGrid from 'src/components/Shared/PaymentGrid'

const FormContext = React.createContext(null)

function FormField({ type, name, Component, valueField, onFocus, language, phone, ...rest }) {
  const { formik, labels } = useContext(FormContext)

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
        formik.setFieldValue(name, v ? v[valueField] ?? v : e.target.value)
      }}
      onFocus={e => {
        if (onFocus && (name == 'idNo' || name == 'search')) {
          onFocus(e.target.value)
        }
        if (onFocus && name == 'cellPhone') {
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
  const [infoAutoFilled, setInfoAutoFilled] = useState(false)
  const [idInfoAutoFilled, setIDInfoAutoFilled] = useState(false)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const [idTypeStore, setIdTypeStore] = useState([])
  const [getValue] = useIdType()
  const [rateType, setRateType] = useState(null)
  const [idNumberOne, setIdNumber] = useState(null)
  const [search, setSearch] = useState(null)
  const [fId, setFId] = useState(SystemFunction.CurrencyPurchase)
  const { platformLabels } = useContext(ControlContext)
  const [formikSettings, setFormik] = useState({})

  const resetAutoFilled = () => {
    setIDInfoAutoFilled(false)
    setInfoAutoFilled(false)
  }

  async function checkTypes(value) {
    if (!value) {
      formik.setFieldValue('id_type', '')
    }
    const idType = await getValue(value)
    if (idType) {
      formik.setFieldValue('id_type', idType.recordId)
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
    amount: formikSettings.initialValuePayment || [],
    date: new Date(),
    clientId: null,
    clientName: null,
    clientType: '1',
    firstName: null,
    lastName: null,
    middleName: null,
    familyName: null,
    fl_firstName: null,
    fl_lastName: null,
    fl_middleName: null,
    fl_familyName: null,
    birthDate: null,
    resident: false,
    professionId: null,
    sponsorName: null,
    idNo: null,
    id_type: null,
    expiryDate: null,
    remarks: null,
    purpose_of_exchange: null,
    nationalityId: null,
    cellPhone: null,
    status: '1',
    type: -1,
    wip: 1,
    functionId: SystemFunction.CurrencyPurchase,
    idNoConfirm: '',
    cellPhoneConfirm: '',
    otp: false,
    search: null
  }

  const { maxAccess } = useDocumentType({
    functionId: fId,
    access: access,
    hasDT: false,
    enabled: !!!recordId
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      id_type: yup.number().required(),
      idNo: yup.number().required(),
      birthDate: yup.string().required(),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      expiryDate: yup.string().required(),
      nationalityId: yup.string().required(),
      cellPhone: yup.string().required(),
      professionId: yup.string().required(),
      operations: yup
        .array()
        .of(
          yup.object().shape({
            currencyId: yup.string().test({
              name: 'currencyId-last-row-check',
              message: 'currencyId is required',
              test(value, context) {
                const { parent } = context

                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  (!parent.fcAmount || parent.fcAmount == 0) &&
                  (!parent.lcAmount || parent.lcAmount == 0) &&
                  (!parent.exRate || parent.exRate == 0)
                )
                  return true

                return value
              }
            }),
            exRate: yup.string().test({
              name: 'exRate-last-row-check',
              message: 'exRate is required',
              test(value, context) {
                const { parent } = context
                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  !parent.currencyId &&
                  (!parent.lcAmount || parent.lcAmount == 0) &&
                  (!parent.fcAmount || parent.fcAmount == 0)
                )
                  return true

                return value
              }
            }),
            fcAmount: yup.string().test({
              name: 'fcAmount-last-row-check',
              message: 'fcAmount is required',
              test(value, context) {
                const { parent } = context
                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  !parent.currencyId &&
                  (!parent.lcAmount || parent.lcAmount == 0) &&
                  (!parent.exRate || parent.exRate == 0)
                )
                  return true

                return value
              }
            }),
            lcAmount: yup.string().test({
              name: 'fcAmount-last-row-check',
              message: 'lcAmount is required',
              test(value, context) {
                const { parent } = context
                if (parent.id == 1 && value) return true
                if (parent.id == 1 && !value) return false
                if (
                  parent.id > 1 &&
                  !parent.currencyId &&
                  (!parent.fcAmount || parent.fcAmount == 0) &&
                  (!parent.exRate || parent.exRate == 0)
                )
                  return true

                return value
              }
            })
          })
        )
        .required(),
      amount: formikSettings?.paymentValidation
    }),
    onSubmit: async values => {
      console.log('values')
      const lastRow = values.operations[values.operations.length - 1]
      const isLastRowMandatoryOnly = !lastRow.currencyId && !lastRow.currencyId && !lastRow.exRate && !lastRow.fcAmount
      let operations = values.operations
      if (isLastRowMandatoryOnly) {
        operations = values.operations?.filter((item, index) => index !== values.operations.length - 1)
      }

      if (
        ((!values?.idNoConfirm && values?.clientId) ||
          (!values?.clientId && !values.cellPhoneConfirm && !values?.idNoConfirm)) &&
        !editMode
      ) {
        stack({
          Component: ConfirmationOnSubmit,
          props: {
            formik: formik,
            labels: labels
          },
          title: labels.confirmation,
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

        const { record: baseAmount } = await getRequest({
          extension: CurrencyTradingSettingsRepository.Defaults.get,
          parameters: '_key=ct_minOtp_CIVAmount'
        })
        const clientId = values.clientId || 0

        const payload = {
          header: {
            recordId: values?.recordId || null,
            dtId,
            reference: values.reference,
            status: values.status,
            date: formatDateToApi(values.date),
            functionId: values.functionId,
            plantId: plantId ? plantId : values.plantId,
            clientId,
            cashAccountId: cashAccountRecord.value,
            poeId: values.purpose_of_exchange,
            wip: values.wip,
            amount: total,
            notes: values.remarks
          },
          items: operations.map(({ id, ...rest }) => ({
            seqNo: id,
            ...rest
          })),
          clientMaster: {
            category: values.clientType,
            reference: null,
            name: null,
            flName: null,
            keyword: null,
            nationalityId: values.nationalityId,
            status: 1,
            addressId: null,
            cellPhone: values.cellPhone,
            oldReference: null,
            otp: false,
            createdDate: formatDateToApi(values.date),
            expiryDate: null,
            professionId: values.professionId
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
            birthDate: formatDateToApi(values.birthDate),
            isResident: values.resident,
            sponsorName: values.sponsorName
          },
          clientID: {
            idNo: values.idNo,
            clientId,
            idtId: values.id_type,
            idExpiryDate: formatDateToApi(values.expiryDate),
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

        const hasKYC = await fetchInfoByKey({ key: values.idNo })

        let totalBaseAmount = ''
        if (total > baseAmount.value && !recordId) {
          if (!hasKYC?.clientRemittance) {
            stackError({
              message: `You need to create full KYC file for this client.`
            })

            return
          }
        } else {
          if (hasKYC?.clientId) {
            const getbase = await getRequest({
              extension: CTTRXrepository.CurrencyTrading.get3,
              parameters: `_clientId=${hasKYC.clientId}`
            })
            totalBaseAmount = parseInt(getbase.record.baseAmount) + parseInt(total)
            if (totalBaseAmount > baseAmount.value && !hasKYC.clientRemittance && !recordId) {
              stackError({
                message: `You need to create full KYC file for this client.`
              })

              return
            }
          }
        }

        const response = await postRequest({
          extension: CTTRXrepository.CurrencyTrading.set2,
          record: JSON.stringify(payload)
        })

        const actionMessage = !recordId ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        formik.setFieldValue('recordId', response.recordId)
        const receivedClient = await getData(response.recordId)
        if ((total > baseAmount.value || totalBaseAmount > baseAmount.value) && !recordId)
          viewOTP(response.recordId, receivedClient)
        invalidate()
      }

      return
    }
  })

  const emptyRows = formik.values.operations.filter(
    row =>
      row.id !== 1 &&
      !row.currencyId &&
      !row.currencyRef &&
      !row.exRate &&
      (!row.fcAmount || row.fcAmount == 0) &&
      (!row.lcAmount || row.lcAmount == 0)
  )

  const dir = JSON.parse(window.localStorage.getItem('settings'))?.direction
  console.log(formik)

  const onClose = async recId => {
    const res = await getRequest({
      extension: CTTRXrepository.CurrencyTrading.get2,
      parameters: `_recordId=${formik.values.recordId ?? recId}`
    })

    const result = res?.record

    const data = {
      recordId: result.headerView?.recordId,
      reference: result.headerView?.reference,
      status: result.headerView?.status,
      functionId: result.headerView?.functionId,
      plantId: result.headerView?.plantId,
      clientId: result.headerView?.clientId,
      cashAccountId: result.headerView.cashAccountId,
      poeId: result.headerView?.poeId,
      wip: result.headerView?.wip,
      otpVerified: result.headerView?.otpVerified,
      amount: String(total || '').replaceAll(',', ''),
      notes: result.headerView?.notes
    }

    const result2 = await postRequest({
      extension: CTTRXrepository.CurrencyTrading.close,
      record: JSON.stringify(data)
    })
    if (result2.recordId) {
      if (recordId) toast.success(platformLabels.Closed)
      invalidate()
      formik.setFieldValue('recordId', result2.recordId)
      await getData(result2.recordId)
    }
  }
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 4

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

      if (!res.record?.value) {
        stackError({ message: platformLabels.rateTypeUndefined })
      } else {
        setRateType(res.record.value)
      }
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
    }).then(res => {
      setIdTypeStore(res.list)
    })
  }

  useEffect(() => {
    fillType()
    ;(async function () {
      setOperationType(formik.values.functionId)
      if (recordId) await getData(recordId)
    })()
  }, [])

  async function getData(id) {
    const res = await getRequest({
      extension: CTTRXrepository.CurrencyTrading.get2,
      parameters: `_recordId=${id}`
    })

    const record = res.record
    if (record) {
      formik.setFieldValue('recordId', record.headerView.recordId)
      formik.setFieldValue('reference', record.headerView.reference)
      formik.setFieldValue(
        'operations',
        record.items.map(({ seqNo, ...rest }) => ({
          id: seqNo,
          ...rest
        }))
      )
      formik.setFieldValue(
        'amount',
        record.cash.map(({ seqNo, ...rest }) => ({
          id: seqNo,
          ...rest
        }))
      )

      formik.setFieldValue('clientType', record.clientMaster.category)
      formik.setFieldValue('date', formatDateFromApi(record.headerView.date))
      formik.setFieldValue('clientId', record.clientIndividual?.clientId)
      formik.setFieldValue('clientName', record.headerView.clientName)
      formik.setFieldValue('functionId', record.headerView.functionId)
      formik.setFieldValue('plantId', record.headerView.plantId)
      formik.setFieldValue('wip', record.headerView.wip)
      formik.setFieldValue('firstName', record.clientIndividual?.firstName)
      formik.setFieldValue('lastName', record.clientIndividual?.lastName)
      formik.setFieldValue('middleName', record.clientIndividual?.middleName)
      formik.setFieldValue('familyName', record.clientIndividual?.familyName)
      formik.setFieldValue('fl_firstName', record.clientIndividual?.fl_firstName)
      formik.setFieldValue('fl_lastName', record.clientIndividual?.fl_lastName)
      formik.setFieldValue('fl_middleName', record.clientIndividual?.fl_middleName)
      formik.setFieldValue('fl_familyName', record.clientIndividual?.fl_familyName)
      formik.setFieldValue('birthDate', formatDateFromApi(record?.clientIndividual?.birthDate))
      formik.setFieldValue('resident', record?.clientIndividual?.isResident)
      formik.setFieldValue('professionId', record.clientMaster?.professionId)
      formik.setFieldValue('sponsorName', record.clientIndividual?.sponsorName)
      formik.setFieldValue('idNo', record.clientIDView.idNo)
      formik.setFieldValue('id_type', record.clientIDView.idtId)
      formik.setFieldValue('expiryDate', formatDateFromApi(record.clientIDView.idExpiryDate))
      formik.setFieldValue('remarks', record.headerView.notes)
      formik.setFieldValue('purpose_of_exchange', record.headerView.poeId)
      formik.setFieldValue('nationalityId', record.clientMaster.nationalityId)
      formik.setFieldValue('cellPhone', record.clientMaster.cellPhone)
      formik.setFieldValue('status', record.headerView.status)
      formik.setFieldValue('cashAccountId', record.headerView.cashAccountId)
      formik.setFieldValue('otp', record.headerView.otpVerified)
      setOperationType(record.headerView.functionId)

      return record?.clientIndividual?.clientId
    }
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

  async function onReopen() {
    const values = formik.values

    const { record: cashAccountRecord } = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userId}&_key=cashAccountId`
    })

    const data = {
      recordId: values?.recordId || null,
      date: formatDateToApi(values.date),
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
      toast.success(platformLabels.Reopened)
      invalidate()
      await getData(res.recordId)
    }
  }

  const total = formik.values.operations.reduce((sumLc, row) => {
    const curValue = parseFloat(row.lcAmount?.toString()?.replace(/,/g, '')) || 0

    return sumLc + curValue
  }, 0)

  const receivedTotal = formik.values.amount.reduce((acc, { amount }) => {
    return acc + (amount || 0)
  }, 0)

  const balance = total - receivedTotal

  function viewOTP(recId, receivedClient) {
    stack({
      Component: OTPPhoneVerification,
      props: {
        values: formik.values,
        recordId: recId,
        clientId: receivedClient,
        functionId: formik.values.functionId,
        onSuccess: () => {
          onClose(recId)
        }
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }

  async function fetchClientInfo({ numberId }) {
    const response = await getRequest({
      extension: CTCLRepository.CtClientIndividual.get2,
      parameters: `_numberId=${numberId}`
    })
    setInfoAutoFilled(false)
    const clientInfo = response && response.record
    if (!!clientInfo) {
      formik.setFieldValue('clientId', clientInfo.clientIndividual.clientId)
      formik.setFieldValue('firstName', clientInfo.clientIndividual.firstName)
      formik.setFieldValue('middleName', clientInfo.clientIndividual.middleName)
      formik.setFieldValue('lastName', clientInfo.clientIndividual.lastName)
      formik.setFieldValue('familyName', clientInfo.clientIndividual.familyName)
      formik.setFieldValue('fl_firstName', clientInfo.clientIndividual.fl_firstName)
      formik.setFieldValue('fl_lastName', clientInfo.clientIndividual.fl_lastName)
      formik.setFieldValue('fl_middleName', clientInfo.clientIndividual.fl_middleName)
      formik.setFieldValue('fl_familyName', clientInfo.clientIndividual.fl_familyName)
      formik.setFieldValue('birthDate', formatDateFromApi(clientInfo.clientIndividual.birthDate))
      formik.setFieldValue('resident', clientInfo.clientIndividual.isResident)
      formik.setFieldValue('sponsorName', clientInfo.clientIndividual.sponsorName)
      formik.setFieldValue('expiryDate', formatDateFromApi(clientInfo.client.expiryDate))
      formik.setFieldValue('professionId', clientInfo.client.professionId)
      formik.setFieldValue('nationalityId', clientInfo.client.nationalityId)
      formik.setFieldValue('cellPhone', clientInfo.client.cellPhone)

      setInfoAutoFilled(true)
    }
  }

  async function fetchInfoByKey({ key }) {
    const response = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get3,
      parameters: `_key=${key}`
    })

    return response.record
  }

  const onPost = async () => {
    const values = formik.values

    const data = {
      recordId: values?.recordId || null,
      date: formatDateToApi(values.date),
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
      toast.success(platformLabels.Posted)
      await getData(res.recordId)
      invalidate()
    }
  }

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !isPosted
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
      disabled: !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Account Balance',
      condition: true,
      onClick: 'onClickAC',
      disabled: false
    }
  ]

  return (
    <FormShell
      actions={actions}
      form={formik}
      initialValues={initialValues}
      setIDInfoAutoFilled={resetAutoFilled}
      resourceId={ResourceIds.CashInvoice}
      editMode={editMode}
      isClosed={isClosed}
      disabledSubmit={balance > 0 && true}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <FormProvider formik={formik} labels={labels} maxAccess={maxAccess}>
            <Grid container sx={{ zIndex: 0 }}>
              <FieldSet title='Transaction'>
                <Grid container spacing={2}>
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
                    <CustomTextField
                      name='search'
                      label={labels.search}
                      value={formik.values?.['idNo']}
                      onBlur={e => {
                        e.target.value &&
                          search != e.target.value &&
                          fetchInfoByKey({ key: e.target.value })
                            .then(info => {
                              if (!!info) {
                                setIDInfoAutoFilled(false)

                                formik.setFieldValue('idNo', info.clientIDView.idNo)
                                formik.setFieldValue('firstName', info.clientIndividual.firstName)
                                formik.setFieldValue('clientId', info.clientId)
                                formik.setFieldValue('middleName', info.clientIndividual.middleName)
                                formik.setFieldValue('lastName', info.clientIndividual.lastName)
                                formik.setFieldValue('familyName', info.clientIndividual.familyName)
                                formik.setFieldValue('fl_firstName', info.clientIndividual.fl_firstName)
                                formik.setFieldValue('fl_lastName', info.clientIndividual.fl_lastName)
                                formik.setFieldValue('fl_middleName', info.clientIndividual.fl_middleName)
                                formik.setFieldValue('fl_familyName', info.clientIndividual.fl_familyName)
                                formik.setFieldValue('birthDate', formatDateFromApi(info.clientIndividual.birthDate))
                                formik.setFieldValue('resident', info.clientIndividual.isResident)
                                formik.setFieldValue('professionId', info.clientMaster.professionId)
                                formik.setFieldValue('sponsorName', info.clientIndividual.sponsorName)
                                formik.setFieldValue('id_type', info.clientIDView.idtId)
                                formik.setFieldValue('nationalityId', info.clientMaster.nationalityId)
                                formik.setFieldValue('cellPhone', info.clientMaster.cellPhone)
                                formik.setFieldValue('expiryDate', formatDateFromApi(info.clientIDView.idExpiryDate))

                                setIDInfoAutoFilled(true)
                              }
                            })
                            .catch(error => {
                              console.error('Error fetching ID info:', error)
                            })
                      }}
                      onClear={() => formik.setFieldValue('idNo', '')}
                      readOnly={editMode || isClosed}
                      onFocus={e => {
                        setSearch(e.target.value)
                      }}
                      required
                    />
                  </Grid>
                </Grid>
              </FieldSet>

              <FieldSet title='Individual'>
                <Grid container>
                  <Grid item xs={4}>
                    <Grid container spacing={2} xs={12} sx={{ px: 2 }}>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='idNo'
                          label={labels.idNo}
                          value={formik.values?.['idNo']}
                          type={showAsPasswordIDNumber && formik.values['idNo'] ? 'password' : 'text'}
                          onChange={e => formik.setFieldValue('idNo', e?.target?.value)}
                          onBlur={e => {
                            if (e.target.value && e.target.value != idNumberOne) {
                              setShowAsPasswordIDNumber(true)
                              checkTypes(e.target.value)
                              fetchClientInfo({ numberId: e.target.value })
                            }
                          }}
                          onKeyDown={() => {}}
                          onFocus={e => {
                            setShowAsPasswordIDNumber(false)
                            setIdNumber(e.target.value)
                          }}
                          onClear={() => formik.setFieldValue('idNo', '')}
                          readOnly={editMode || isClosed || idInfoAutoFilled}
                          required
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <CustomDatePicker
                          name='birthDate'
                          label={labels.birthDate}
                          value={formik.values?.birthDate}
                          required={true}
                          onChange={formik.setFieldValue}
                          onClear={() => formik.setFieldValue('birthDate', '')}
                          error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <CustomDatePickerHijri
                          name='birthdatehijri'
                          label={labels.birthDateHijri}
                          value={formik.values?.birthDate}
                          onChange={(name, value) => {
                            formik.setFieldValue('birthDate', value)
                          }}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          onClear={() => formik.setFieldValue('birthDate', '')}
                        />
                      </Grid>
                      <Grid item xs={6}>
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
                      <Grid item xs={6}>
                        <Button
                          variant='contained'
                          onClick={() =>
                            stack({
                              Component: Confirmation,
                              props: {
                                idTypeStore: idTypeStore,
                                clientformik: formik,
                                labels: labels
                              },
                              title: labels.fetch,
                              width: 400,
                              height: 400
                            })
                          }
                          disabled={
                            !formik?.values?.id_type ||
                            !formik?.values?.birthDate ||
                            !formik.values.idNo ||
                            (formik.values?.expiryDate && new Date(formik.values?.expiryDate) >= new Date())
                              ? true
                              : false
                          }
                        >
                          {labels.fetch}
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <CustomDatePicker
                          name='expiryDate'
                          label={labels.expiryDate}
                          value={formik.values?.expiryDate}
                          required={true}
                          onChange={formik.setFieldValue}
                          onClear={() => formik.setFieldValue('expiryDate', '')}
                          error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid container rowGap={2} xs={8} sx={{ pl: 4, alignContent: 'start' }}>
                    <Grid xs={12} container spacing={2} sx={{ direction: dir }}>
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
                    <Grid xs={12} container spacing={2} sx={{ flexDirection: 'row-reverse', direction: dir }}>
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

                    <Grid container spacing={2} xs={12}>
                      <Grid item xs={4}>
                        <FormField
                          type={showAsPasswordPhone && formik.values['cellPhone'] ? 'password' : 'text'}
                          name='cellPhone'
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
                      <Grid item xs={4}>
                        <FormField
                          name='nationalityId'
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
                      <Grid item xs={4}>
                        <FormField
                          name='professionId'
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

                      <Grid item xs={4}>
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

                      <Grid item xs={2}>
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
                      <Grid item xs={6}>
                        <FormField name='sponsorName' Component={CustomTextField} readOnly={editMode || isClosed} />
                      </Grid>

                      <Grid item xs={6}>
                        <FormField name='remarks' Component={CustomTextField} readOnly={editMode || isClosed} />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </FieldSet>
              <FieldSet title='Operations'>
                <Grid width={'100%'}>
                  <DataGrid
                    onChange={value => formik.setFieldValue('operations', value)}
                    value={formik.values.operations}
                    error={emptyRows.length < 1 ? formik.errors.operations : true}
                    height={200}
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
                              currencyName: '',
                              currencyRef: '',
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

                            !isNaN(lcAmount) && update({ lcAmount: lcAmount })
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
                          const rateCalcMethod = newRow.rateCalcMethod
                          const exRate = newRow.exRate

                          const lcAmount =
                            rateCalcMethod === 1 ? fcAmount * exRate : rateCalcMethod === 2 ? fcAmount / exRate : 0

                          !isNaN(lcAmount) &&
                            update({
                              lcAmount: lcAmount?.toFixed(2)
                            })
                        },
                        defaultValue: ''
                      },
                      {
                        component: 'numberfield',
                        label: labels.defaultRate,
                        name: 'defaultRate',
                        props: { readOnly: true }
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
                          const lcAmount = newRow.lcAmount
                          const rateCalcMethod = newRow.rateCalcMethod
                          const exRate = newRow.exRate
                          if (exRate)
                            if (exRate >= newRow.minRate && exRate <= newRow.maxRate) {
                              if (fcAmount) {
                                const lcAmount =
                                  rateCalcMethod === 1
                                    ? fcAmount * exRate
                                    : rateCalcMethod === 2
                                    ? fcAmount / exRate
                                    : 0
                                !isNaN(lcAmount) &&
                                  update({
                                    lcAmount: lcAmount.toFixed(2)
                                  })
                              } else if (lcAmount) {
                                const fcAmount =
                                  rateCalcMethod === 2
                                    ? lcAmount * exRate
                                    : rateCalcMethod === 1
                                    ? lcAmount / exRate
                                    : 0
                                !isNaN(fcAmount) &&
                                  update({
                                    fcAmount: fcAmount.toFixed(2)
                                  })
                              } else {
                                update({
                                  exRate: newRow?.exRate
                                })
                              }
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
                          const rateCalcMethod = newRow.rateCalcMethod
                          const exRate = newRow.exRate

                          const fcAmount =
                            rateCalcMethod === 2 ? lcAmount * exRate : rateCalcMethod === 1 ? lcAmount / exRate : 0

                          if (fcAmount && newRow.exRate)
                            update({
                              fcAmount: fcAmount.toFixed(2)
                            })
                        },

                        defaultValue: ''
                      }
                    ]}
                  />
                </Grid>
              </FieldSet>
              <FieldSet title='Amount'>
                <Grid container xs={12}>
                  <Grid item xs={9}>
                    <Grid container xs={12} spacing={2}>
                      <Grid width={'100%'}>
                        <PaymentGrid
                          height={200}
                          onChange={value => formik.setFieldValue('amount', value)}
                          value={formik.values.amount}
                          error={formik.errors.amount}
                          name={'amount'}
                          setFormik={setFormik}
                          amount={total}
                          disabled={isClosed}
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
