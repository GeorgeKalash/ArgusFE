import { Button, Grid } from '@mui/material'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
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
import { DataSets } from 'src/resources/DataSets'
import OTPAuthentication from 'src/components/Shared/OTPAuthentication'
import CustomRadioButtonGroup from 'src/components/Inputs/CustomRadioButtonGroup'
import useResourceParams from 'src/hooks/useResourceParams'
import useSetWindow from 'src/hooks/useSetWindow'

const TransactionForm = ({ recordId, plantId, window: windowStack }) => {
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

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.CashInvoice,
    editMode: !!recordId
  })

  useSetWindow({ title: labels?.cashInvoice, window: windowStack })

  const initialValues = {
    recordId: null,
    reference: null,
    operations: [
      {
        id: 1,
        currencyId: '',
        oldNote: false,
        fcAmount: '',
        defaultRate: '',
        exRate: '',
        lcAmount: '',
        minRate: '',
        maxRate: ''
      }
    ],
    amount: formikSettings.initialValuePayment || [],
    date: '',
    clientId: null,
    clientName: null,
    clientType: '1',
    firstName: null,
    lastName: null,
    middleName: null,
    fl_firstName: null,
    fl_lastName: null,
    fl_middleName: null,
    birthDate: null,
    resident: false,
    professionId: null,
    sponsorName: '',
    idNo: null,
    id_type: null,
    expiryDate: null,
    remarks: null,
    purpose_of_exchange: null,
    nationalityId: null,
    nationalityType: null,
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

  async function fetchInfoByKey({ key }) {
    const res = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get3,
      parameters: `_key=${key}`
    })
    setIDInfoAutoFilled(false)

    formik.setFieldValue('idNo', res?.record?.clientIDView.idNo)
    formik.setFieldValue('firstName', res?.record?.clientIndividual.firstName)
    formik.setFieldValue('clientId', res?.record?.clientId)
    formik.setFieldValue('middleName', res?.record?.clientIndividual.middleName)
    formik.setFieldValue('lastName', res?.record?.clientIndividual.lastName)
    formik.setFieldValue('fl_firstName', res?.record?.clientIndividual.fl_firstName)
    formik.setFieldValue('fl_lastName', res?.record?.clientIndividual.fl_lastName)
    formik.setFieldValue('fl_middleName', res?.record?.clientIndividual.fl_middleName)
    formik.setFieldValue('birthDate', formatDateFromApi(res?.record?.clientIndividual.birthDate))
    formik.setFieldValue('resident', res?.record?.clientIndividual.isResident)
    formik.setFieldValue('professionId', res?.record?.clientMaster.professionId)
    formik.setFieldValue('sponsorName', res?.record?.clientIndividual.sponsorName)
    formik.setFieldValue('id_type', res?.record?.clientIDView.idtId)
    formik.setFieldValue('nationalityId', res?.record?.clientMaster.nationalityId)
    formik.setFieldValue('nationalityType', res?.record?.clientMaster.nationalityId === 195 ? 1 : 2)
    formik.setFieldValue('cellPhone', res?.record?.clientMaster.cellPhone)
    formik.setFieldValue('expiryDate', formatDateFromApi(res?.record?.clientIDView.idExpiryDate))

    setIDInfoAutoFilled(true)

    return res.record
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validateOnChange: true,
    validateOnBlur: true,
    validate: values => {
      const errors = {}
      const total = checkAmountValidation(values.operations)
      if (total && !values.id_type) errors['id_type'] = ' '
      if (total && !values.idNo) errors['idNo'] = ' '
      if (total && !values.birthDate) errors['birthDate'] = ' '
      if (total && !values.firstName) errors['firstName'] = ' '
      if (total && !values.lastName) errors['lastName'] = ' '
      if (total && !values.expiryDate) errors['expiryDate'] = ' '
      if (total && !values.nationalityId) errors['nationalityId'] = ' '
      if (total && !values.cellPhone) errors['cellPhone'] = ' '
      if (total && !values.professionId) errors['professionId'] = ' '

      return errors
    },
    validationSchema: yup.object({
      date: yup.string().required(),
      nationalityType: yup.number().required(),
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
      const lastRow = values.operations[values.operations.length - 1]
      const isLastRowMandatoryOnly = !lastRow.currencyId && !lastRow.currencyId && !lastRow.exRate && !lastRow.fcAmount
      let operations = values.operations
      if (isLastRowMandatoryOnly) {
        operations = values.operations?.filter((item, index) => index !== values.operations.length - 1)
      }
      if (
        ((!values?.idNoConfirm && values?.clientId) ||
          (!values?.clientId && !values.cellPhoneConfirm && !values?.idNoConfirm)) &&
        !editMode &&
        values?.idNo !== null
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
        console.log(formik.values.amount)

        const payload = {
          header: {
            recordId: values?.recordId || null,
            dtId,
            reference: values.reference,
            nationalityId: values.nationalityId,
            nationalityType: values.nationalityType,
            status: values.status,
            date: formatDateToApi(values.date),
            functionId: values.functionId,
            plantId: plantId ? plantId : values.plantId,
            clientId: total < 5000 && !clientId ? -1 : clientId,
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
            nationalityType: values.nationalityType,
            status: 1,
            addressId: null,
            cellPhone: values.cellPhone,
            oldReference: null,
            otp: false,
            createdDate: formatDateToApi(values.date),
            expiryDate: values.expiryDate,
            professionId: values.professionId
          },
          clientIndividual: {
            clientId: total < 5000 && !clientId ? -1 : clientId,
            firstName: values.firstName,
            lastName: values.lastName,
            middleName: values.middleName,
            fl_firstName: values.fl_firstName,
            fl_lastName: values.fl_lastName,
            fl_middleName: values.fl_middleName,
            birthDate: formatDateToApi(values.birthDate),
            isResident: values.resident,
            sponsorName: values.sponsorName
          },
          clientID: {
            idNo: values.idNo,
            clientId: total < 5000 && !clientId ? -1 : clientId,
            idtId: values.id_type,
            idExpiryDate: formatDateToApi(values.expiryDate),
            idIssueDate: null,
            idCityId: null,
            isDiplomat: false
          },

          cash:
            formik.values.amount.length > 0 &&
            formik.values.amount.map(({ seqNo, types, cashAccountId, ...rest }) => ({
              seqNo,
              cashAccountId: cashAccountRecord.value,
              ...rest
            }))
        }

        if (values.idNo) {
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

  const checkAmountValidation = array => {
    const total = array.reduce((sumLc, row) => {
      const curValue = parseFloat(row.lcAmount?.toString()?.replace(/,/g, '')) || 0

      return sumLc + curValue
    }, 0)

    return total >= 5000 ? true : false
  }

  const emptyRows = formik.values.operations.filter(
    row =>
      row.id !== 1 &&
      !row.currencyId &&
      !row.currencyRef &&
      !row.exRate &&
      (!row.fcAmount || row.fcAmount == 0) &&
      (!row.lcAmount || row.lcAmount == 0)
  )

  const onClose = async recId => {
    const res = await getRequest({
      extension: CTTRXrepository.CurrencyTrading.get2,
      parameters: `_recordId=${formik.values.recordId ?? recId}`
    })

    const result = res?.record

    const data = {
      recordId: result.headerView?.recordId,
      reference: result.headerView?.reference,
      nationalityId: result.headerView?.nationalityId,
      nationalityType: result.headerView?.nationalityType,
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
      formik.setFieldValue('recordId', result2.recordId)
      const receivedClient = await getData(result2.recordId)
      isReleased && viewOTP(result2.recordId, receivedClient)
    }
    invalidate()
  }
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 3
  const isReleased = formik.values.status === 4

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

  useEffect(() => {
    ;(async function () {
      setOperationType(formik.values.functionId)
      if (recordId) await getData(recordId)
      if (!recordId) formik.setFieldValue('date', new Date())
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
      formik.setFieldValue('nationalityId', record.headerView.nationalityId)
      formik.setFieldValue('nationalityType', record.headerView.nationalityId === 195 ? 1 : 2)
      formik.setFieldValue(
        'operations',
        record.items.map(({ seqNo, ...rest }) => ({
          id: seqNo,
          ...rest
        }))
      )
      formik.setFieldValue(
        'amount',
        record?.cash?.length != 0
          ? record.cash?.map((item, index) => ({
              id: index + 1,
              pos: item?.type != 3,
              ...item
            }))
          : formik.initialValues.amount
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
      formik.setFieldValue('fl_firstName', record.clientIndividual?.fl_firstName)
      formik.setFieldValue('fl_lastName', record.clientIndividual?.fl_lastName)
      formik.setFieldValue('fl_middleName', record.clientIndividual?.fl_middleName)
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
  const { userId } = JSON.parse(window?.sessionStorage?.getItem('userData'))

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
      nationalityId: values.nationalityId,
      nationalityType: values.nationalityType,
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
      await getData(res.recordId)
    }
    invalidate()
  }

  const total = formik.values.operations.reduce((sumLc, row) => {
    const curValue = parseFloat(row.lcAmount?.toString()?.replace(/,/g, '')) || 0

    return sumLc + curValue
  }, 0)

  const receivedTotal = formik.values.amount.reduce((acc, { amount }) => {
    return acc + parseFloat(amount?.toString()?.replace(/,/g, '')) || 0
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
      }
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
      formik.setFieldValue('fl_firstName', clientInfo.clientIndividual.fl_firstName)
      formik.setFieldValue('fl_lastName', clientInfo.clientIndividual.fl_lastName)
      formik.setFieldValue('fl_middleName', clientInfo.clientIndividual.fl_middleName)
      formik.setFieldValue('birthDate', formatDateFromApi(clientInfo.clientIndividual.birthDate))
      formik.setFieldValue('resident', clientInfo.clientIndividual.isResident)
      formik.setFieldValue('sponsorName', clientInfo.clientIndividual.sponsorName)
      formik.setFieldValue('expiryDate', formatDateFromApi(clientInfo.client.expiryDate))
      formik.setFieldValue('professionId', clientInfo.client.professionId)
      formik.setFieldValue('nationalityId', clientInfo.client.nationalityId)
      formik.setFieldValue('nationalityType', clientInfo.client.nationalityId === 195 ? 1 : 2)
      formik.setFieldValue('cellPhone', clientInfo.client.cellPhone)

      setInfoAutoFilled(true)
    }
  }

  function viewAuthOTP() {
    stack({
      Component: OTPAuthentication,
      props: {
        values: formik.values,
        PlantSupervisors: true,
        onClose: () => Post()
      },
      expandable: false,
      spacing: false
    })
  }

  const onPost = () => {
    if (!formik.values.otp) {
      viewAuthOTP()

      return
    } else Post()
  }

  const Post = async () => {
    const values = formik.values

    const data = {
      recordId: values?.recordId || null,
      date: formatDateToApi(values.date),
      reference: values.reference,
      nationalityId: values.nationalityId,
      nationalityType: values.nationalityType,
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
      key: 'Locked',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
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
      key: 'OTP',
      condition: true,
      onClick: viewOTP,
      disabled: !editMode || (isPosted && !isReleased)
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
      isParentWindow={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FieldSet title='Transaction'>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik.values.reference}
                      readOnly={editMode}
                      maxLength='20'
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('reference', '')}
                      error={formik.touched.reference && Boolean(formik.errors.reference)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <FormGrid hideonempty item xs={3}>
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
                  <Grid item xs={3}>
                    <ResourceComboBox
                      datasetId={DataSets.DOCUMENT_STATUS}
                      name='status'
                      label={labels.status}
                      valueField='key'
                      displayField='value'
                      values={formik.values}
                      readOnly
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('status', newValue?.key)
                      }}
                      maxAccess={maxAccess}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='search'
                      label={labels.search}
                      value={formik.values.search}
                      readOnly={editMode || isClosed}
                      maxLength='20'
                      required
                      onChange={e => {
                        const value = e.target.value
                        setSearch(value)
                        value && search != value && fetchInfoByKey({ key: value })
                      }}
                      onFocus={value => {
                        setSearch(value)
                      }}
                      onClear={() => formik.setFieldValue('search', '')}
                      error={formik.touched.search && Boolean(formik.errors.search)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomRadioButtonGroup
                      options={[
                        {
                          label: labels.purchase,
                          value: SystemFunction.CurrencyPurchase
                        },
                        {
                          label: labels.sale,
                          value: SystemFunction.CurrencySale
                        }
                      ]}
                      value={formik.values.functionId}
                      onChange={e => {
                        const newValue = e.target.value
                        setOperationType(parseInt(newValue))
                        setFId(newValue)
                        formik.setFieldValue('reference', '')
                      }}
                      disabledCondition={() => formik?.values?.operations[0]?.currencyId !== ''}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      datasetId={DataSets.NATIONALITY}
                      name='nationalityType'
                      label={labels.nationalityType}
                      readOnly={editMode || isClosed || idInfoAutoFilled}
                      valueField='key'
                      displayField='value'
                      values={formik.values}
                      required
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('nationalityType', newValue?.key || null)
                      }}
                      maxAccess={maxAccess}
                      error={formik.touched.nationalityType && Boolean(formik.errors.nationalityType)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomRadioButtonGroup
                      options={[
                        { label: labels.individual, value: '1' },
                        { label: labels.corporate, value: '2', disabled: true }
                      ]}
                      value={formik.values.clientType}
                      onChange={e => formik.setFieldValue('clientType', e.target.value)}
                      disabledCondition={() => formik?.values?.operations[0]?.currencyId !== ''}
                    />
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={12}>
              <FieldSet title='Individual'>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='idNo'
                          label={labels.idNo}
                          displayType={showAsPasswordIDNumber && formik.values['idNo'] ? 'password' : ''}
                          value={formik.values.idNo}
                          readOnly={editMode || isClosed || idInfoAutoFilled}
                          required={total >= 5000}
                          maxLength='20'
                          onBlur={e => {
                            const value = e.target.value
                            setIdNumber(value)
                            if (value && value !== idNumberOne) {
                              setShowAsPasswordIDNumber(true)
                              checkTypes(value)
                              fetchClientInfo({ numberId: value })
                            }
                          }}
                          onFocus={e => {
                            setShowAsPasswordIDNumber(false)
                          }}
                          onClear={() => {
                            formik.setFieldValue('idNo', '')
                            setIdNumber('')
                          }}
                          onChange={formik.handleChange}
                          error={formik.touched.idNo && Boolean(formik.errors.idNo)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <CustomDatePicker
                          name='birthDate'
                          label={labels.birthDate}
                          value={formik.values?.birthDate}
                          required={total >= 5000}
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
                        <ResourceComboBox
                          name='id_type'
                          endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                          label={labels.id_type}
                          valueField='recordId'
                          displayField='name'
                          onChange={(event, newValue) => {
                            formik.setFieldValue('id_type', newValue?.key || null)
                          }}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          values={formik.values}
                          required={total >= 5000}
                          maxAccess={maxAccess}
                          error={formik.touched.id_type && Boolean(formik.errors.id_type)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant='contained'
                          sx={{
                            '&:hover': {
                              opacity: 0.8
                            },
                            width: 'auto',
                            height: '33px',
                            objectFit: 'contain',
                            minWidth: 'auto'
                          }}
                          onClick={() =>
                            stack({
                              Component: Confirmation,
                              props: {
                                idTypes: idTypeStore,
                                clientformik: formik,
                                labels: labels
                              }
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
                          required={total >= 5000}
                          onChange={formik.setFieldValue}
                          onClear={() => formik.setFieldValue('expiryDate', '')}
                          error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='firstName'
                          label={labels.firstName}
                          value={formik.values.firstName}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          required={total >= 5000}
                          maxLength='20'
                          onChange={formik.handleChange}
                          forceUpperCase={true}
                          onClear={() => formik.setFieldValue('firstName', '')}
                          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='middleName'
                          label={labels.middleName}
                          value={formik.values.middleName}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          maxLength='20'
                          onChange={formik.handleChange}
                          forceUpperCase={true}
                          onClear={() => formik.setFieldValue('middleName', '')}
                          error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='lastName'
                          label={labels.lastName}
                          value={formik.values.lastName}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          required={total >= 5000}
                          maxLength='20'
                          onChange={formik.handleChange}
                          forceUpperCase={true}
                          onClear={() => formik.setFieldValue('lastName', '')}
                          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={2} sx={{ flexDirection: 'row-reverse' }}>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_firstName'
                              label={labels.fl_firstName}
                              value={formik.values.fl_firstName}
                              readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                              dir='rtl'
                              language='arabic'
                              onChange={formik.handleChange}
                              forceUpperCase={true}
                              onClear={() => formik.setFieldValue('fl_firstName', '')}
                              error={formik.touched.fl_firstName && Boolean(formik.errors.fl_firstName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_middleName'
                              label={labels.fl_middleName}
                              value={formik.values.fl_middleName}
                              readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                              dir='rtl'
                              language='arabic'
                              onChange={formik.handleChange}
                              forceUpperCase={true}
                              onClear={() => formik.setFieldValue('fl_middleName', '')}
                              error={formik.touched.fl_middleName && Boolean(formik.errors.fl_middleName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_lastName'
                              label={labels.fl_lastName}
                              value={formik.values.fl_lastName}
                              readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                              dir='rtl'
                              language='arabic'
                              onChange={formik.handleChange}
                              forceUpperCase={true}
                              onClear={() => formik.setFieldValue('fl_lastName', '')}
                              error={formik.touched.fl_lastName && Boolean(formik.errors.fl_lastName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='cellPhone'
                          phone={true}
                          label={labels.cellPhone}
                          value={formik.values?.cellPhone}
                          onChange={formik.handleChange}
                          onBlur={e => {
                            setShowAsPasswordPhone(true)
                          }}
                          onFocus={value => {
                            setShowAsPasswordPhone(false)
                          }}
                          maxLength='20'
                          required={total >= 5000}
                          onClear={() => formik.setFieldValue('cellPhone', '')}
                          error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                          maxAccess={maxAccess}
                          readOnly={editMode || isClosed || idInfoAutoFilled}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceComboBox
                          name='nationalityId'
                          endpointId={SystemRepository.Country.qry}
                          label={labels.nationalityId}
                          valueField='recordId'
                          displayField={['reference', 'name', 'flName']}
                          values={formik.values}
                          columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' },
                            { key: 'flName', value: 'Foreign Language Name' }
                          ]}
                          required={total >= 5000}
                          onChange={(event, newValue) => {
                            formik && formik.setFieldValue('nationalityId', newValue?.recordId)
                          }}
                          maxAccess={maxAccess}
                          readOnly={editMode || isClosed || idInfoAutoFilled}
                          error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceComboBox
                          name='professionId'
                          endpointId={RemittanceSettingsRepository.Profession.qry}
                          label={labels.professionId}
                          valueField='recordId'
                          displayField={['reference', 'name']}
                          readOnly={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                          values={formik.values}
                          required={total >= 5000}
                          columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' }
                          ]}
                          onChange={(event, newValue) => {
                            formik && formik.setFieldValue('professionId', newValue?.key)
                          }}
                          maxAccess={maxAccess}
                          error={formik.touched.professionId && Boolean(formik.errors.professionId)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <CustomTextField
                          name='sponsorName'
                          label={labels.sponsorName}
                          value={formik.values.sponsorName}
                          readOnly={editMode || isClosed}
                          maxLength='20'
                          onChange={formik.handleChange}
                          forceUpperCase={true}
                          onClear={() => formik.setFieldValue('sponsorName', '')}
                          error={formik.touched.sponsorName && Boolean(formik.errors.sponsorName)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <CustomTextField
                          name='remarks'
                          label={labels.remarks}
                          value={formik.values.remarks}
                          readOnly={editMode || isClosed}
                          maxLength='20'
                          onChange={formik.handleChange}
                          forceUpperCase={true}
                          onClear={() => formik.setFieldValue('remarks', '')}
                          error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <ResourceComboBox
                          name='purpose_of_exchange'
                          endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                          label={labels.purpose_of_exchange}
                          valueField='recordId'
                          displayField={['reference', 'name']}
                          columnsInDropDown={[
                            { key: 'reference', value: 'Reference' },
                            { key: 'name', value: 'Name' }
                          ]}
                          onChange={(event, newValue) => {
                            formik && formik.setFieldValue('purpose_of_exchange', newValue?.key)
                          }}
                          readOnly={editMode || isClosed}
                          values={formik.values}
                          maxAccess={maxAccess}
                          error={formik.touched.purpose_of_exchange && Boolean(formik.errors.purpose_of_exchange)}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <CustomCheckBox
                          name='resident'
                          value={formik.values.resident}
                          onChange={event => formik.setFieldValue('resident', event.target.checked)}
                          label={'Resident'}
                          maxAccess={maxAccess}
                          disabled={editMode || isClosed || idInfoAutoFilled || infoAutoFilled}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <CustomCheckBox
                          name='otp'
                          value={formik.values.otp}
                          onChange={event => formik.setFieldValue('otp', event.target.checked)}
                          label={'Otp'}
                          maxAccess={maxAccess}
                          disabled={true}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={12}>
              <FieldSet title='Operations'>
                <DataGrid
                  onChange={value => formik.setFieldValue('operations', value)}
                  value={formik.values.operations}
                  error={emptyRows.length < 1 ? formik.errors.operations : true}
                  initialValues={formik?.initialValues?.operations?.[0]}
                  height={175}
                  disabled={isClosed}
                  maxAccess={maxAccess}
                  allowDelete={!editMode}
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
                      }
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
                                rateCalcMethod === 1 ? fcAmount * exRate : rateCalcMethod === 2 ? fcAmount / exRate : 0
                              !isNaN(lcAmount) &&
                                update({
                                  lcAmount: lcAmount.toFixed(2)
                                })
                            } else if (lcAmount) {
                              const fcAmount =
                                rateCalcMethod === 2 ? lcAmount * exRate : rateCalcMethod === 1 ? lcAmount / exRate : 0
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
                      }
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
                      }
                    }
                  ]}
                />
              </FieldSet>
            </Grid>
            <Grid item xs={12}>
              <FieldSet title='Amount'>
                <Grid container spacing={2}>
                  <Grid item xs={9} key={formik.values.amount?.length}>
                    <PaymentGrid
                      height={175}
                      onChange={value => formik.setFieldValue('amount', value)}
                      value={formik.values.amount}
                      error={formik.errors.amount}
                      name='amount'
                      setFormik={setFormik}
                      data={{
                        recordId: formik.values?.recordId,
                        reference: formik.values?.reference,
                        clientName: formik.values?.clientName,
                        viewPosButtons: formik.values.wip === 2
                      }}
                      amount={total}
                      disabled={editMode || isClosed}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Grid container spacing={3}>
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
                </Grid>
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

TransactionForm.width = 1200
TransactionForm.height = 600

export default TransactionForm
