import { useEffect } from 'react'
import { Grid, Button } from '@mui/material'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import * as yup from 'yup'
import { useWindow } from 'src/windows'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import BenificiaryBankForm from 'src/components/Shared/BenificiaryBankForm'
import BenificiaryCashForm from 'src/components/Shared/BenificiaryCashForm'
import InstantCash from './InstantCash'
import TerraPay from './TerraPay'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ProductsWindow from '../Windows/ProductsWindow'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { useError } from 'src/error'
import toast from 'react-hot-toast'
import { SystemFunction } from 'src/resources/SystemFunction'
import FieldSet from 'src/components/Shared/FieldSet'
import { DataSets } from 'src/resources/DataSets'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import FormGrid from 'src/components/form/layout/FormGrid'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useForm } from 'src/hooks/form'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { useInvalidate } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'

export default function OutwardsForm({ labels, access, recordId, cashAccountId, plantId, userId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.Outwards,
    access,
    hasDT: false
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot
  })

  const initialValues = {
    recordId: recordId || null,
    dtId: null,
    plantId: plantId,
    cashAccountId: cashAccountId,
    userId: userId,
    productId: '',
    dispersalId: '',
    countryId: '',
    dispersalType: '',
    dispersalTypeName: '',
    currencyId: '',
    currencyRef: '',
    idNo: '',
    beneficiaryId: '',
    beneficiarySeqNo: '',
    beneficiaryName: '',
    clientId: '',
    clientRef: '',
    clientName: '',
    nationalityId: '',
    fcAmount: null,
    corId: '',
    corRef: '',
    corName: '',
    commission: null,
    defaultCommission: null,
    lcAmount: null,
    amount: 0,
    exRate: null,
    rateCalcMethod: null,
    wip: 1,
    status: 1,
    statusName: '',
    releaseStatus: '',
    rsName: '',
    wipName: '',
    reference: '',
    date: new Date(),
    firstName: '',
    middleName: '',
    lastName: '',
    familyName: '',
    fl_firstName: '',
    fl_middleName: '',
    fl_lastName: '',
    fl_familyName: '',
    expiryDate: null,
    professionId: '',
    cellPhone: '',
    poeId: '',
    status: 1,
    ttNo: '',
    tokenNo: '',
    trackingNo: '',
    valueDate: new Date(),
    defaultValueDate: new Date(),
    vatAmount: null,
    vatRate: null,
    tdAmount: 0,
    giftCode: '',
    details: '',
    hiddenTrxAmount: '',
    hiddenTrxCount: '',
    hiddenSponserName: '',
    otpVerified: false,
    bankType: '',
    amountRows: [
      {
        id: 1,
        outwardId: '',
        seqNo: '',
        cashAccountId: cashAccountId,
        cashAccount: '',
        ccId: '',
        ccName: '',
        type: '',
        amount: '',
        bankFees: '',
        receiptRef: ''
      }
    ],
    instantCashDetails: {},
    terraPayDetails: {
      quotation: {
        requestDate: new Date(),
        debitorMSIDSN: '', //HERE
        creditorMSIDSN: '', //  ben phone number
        creditorBankAccount: '', // ben.bankaccount is IBAN
        creditorReceivingCountry: '',
        requestAmount: '', //HERE
        requestCurrency: '', // SEND CURRENCY REF is the receiving (rreceiver)
        sendingCurrency: '', // SEND CURRENCY REF is the receiving (rreceiver)
        receivingCurrency: '' // SEND CURRENCY REF is the receiving (rreceiver)
      },
      transaction: {
        amount: '', //HERE
        currency: '', //SAME AS SENDING CURRRENCY
        type: 'inttransfer', //FAWZI TO CHECK
        descriptionText: '',
        requestDate: new Date(),
        requestingOrganisationTransactionReference: '',
        debitorMSIDSN: '', //HERE
        creditorBankAccount: '', // ben.bankaccount is IBAN
        creditorSortCode: '0001', // Fawzi To check
        creditorBankSubCode: '',
        creditorAccounttype: 'Savings',
        senderKyc: {
          nationality: '',
          dateOfBirth: new Date(),
          gender: '',
          idDocument: [],
          postalAddress: {
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            city: '',
            stateProvince: '',
            postalCode: '',
            country: ''
          },
          subjectName: {
            title: '',
            firstName: '',
            middleName: '',
            lastName: '',
            fullName: ''
          }
        },
        recipientKyc: {
          nationality: '',
          dateOfBirth: new Date(),
          idDocument: [],
          postalAddress: {
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            city: '',
            stateProvince: '',
            postalCode: '',
            country: ''
          },
          subjectName: {
            title: '',
            firstName: '',
            middleName: '',
            lastName: '',
            fullName: ''
          }
        },
        internationalTransferInformation: {
          quoteId: '',
          receivingCountry: '',
          remittancePurpose: '',
          sourceOfFunds: '',
          relationshipSender: ''
        }
      }
    }
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validateOnChange: true,
    validationSchema: yup.object({
      valueDate: yup.string().required(' '),
      countryId: yup.string().required(' '),
      dispersalType: yup.string().required(' '),
      currencyId: yup.string().required(' '),
      fcAmount: yup.string().required(' '),
      productId: yup.string().required(' '),
      commission: yup.string().required(' '),
      lcAmount: yup.string().required(' '),
      exRate: yup.string().required(' '),
      clientId: yup.string().required(' '),
      poeId: yup.string().required(' '),
      beneficiaryId: yup.string().required(' '),
      tdAmount: yup.number().test(`isCommission less than tdAmount`, `Error`, function (value) {
        const { commission } = this.parent

        return value <= commission
      }),
      amountRows: yup
        .array()
        .of(
          yup.object().shape({
            type: yup.string().required('Type is required'),
            amount: yup.string().nullable().required('amount is required')
          })
        )
        .required('Cash array is required')
    }),
    onSubmit: async values => {
      try {
        const copy = { ...values }
        delete copy.amountRows
        delete copy.instantCashDetails
        delete copy.terraPayDetails
        copy.date = formatDateToApi(copy.date)
        copy.valueDate = formatDateToApi(copy.valueDate)
        copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
        copy.vatAmount = vatAmount
        copy.amount = amount

        const updatedRows = formik.values.amountRows.map((amountDetails, index) => {
          const seqNo = index + 1

          return {
            ...amountDetails,
            seqNo: seqNo,
            cashAccountId: cashAccountId,
            outwardId: formik.values.recordId || 0
          }
        })

        console.log('vals', copy)
        //terraPayFill(copy)

        const amountGridData = {
          header: copy,
          cash: updatedRows,
          bankType: formik.values.bankType,
          ICRequest: formik.values.instantCashDetails?.deliveryModeId ? formik.values.instantCashDetails : null,
          TPRequest: mapTerraPayDetails(copy) /* {
            ...formik.values.terraPayDetails,
            quotation: {
              ...formik.values.terraPayDetails.quotation,
              sendingCurrency: formik.values.currencyRef,
            },
            transaction: {
              ...formik.values.terraPayDetails.transaction,
              currency: formik.values.currencyRef,
            }
          } */
        }

        const amountRes = await postRequest({
          extension: RemittanceOutwardsRepository.OutwardsTransfer.set2,
          record: JSON.stringify(amountGridData)
        })

        if (amountRes.recordId) {
          const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
          toast.success(actionMessage)
          formik.setFieldValue('recordId', amountRes.recordId)
          const res2 = await getOutwards(amountRes.recordId)
          formik.setFieldValue('reference', res2.record.headerView.reference)
          invalidate()
          !recordId && viewOTP(amountRes.recordId)
        }
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 4

  const mapTerraPayDetails = values => {
    console.log('IN', values)
    const updateDate = date => (date && !/^\/Date\(/.test(date) ? formatDateToApi(date) : date)

    return {
      ...formik.values.terraPayDetails,
      quotation: {
        ...formik.values.terraPayDetails.quotation,
        sendingCurrency: values.currencyRef,
        debitorMSIDSN: values.cellPhone,
        requestAmount: values.amount,
        requestDate: updateDate(formik.values.terraPayDetails.quotation.requestDate)
      },
      transaction: {
        ...formik.values.terraPayDetails.transaction,
        currency: values.currencyRef,
        debitorMSIDSN: values.cellPhone,
        amount: values.amount,
        requestDate: updateDate(formik.values.terraPayDetails.transaction.requestDate),
        senderKyc: {
          ...formik.values.terraPayDetails.transaction.senderKyc,
          dateOfBirth: updateDate(formik.values.terraPayDetails.transaction.senderKyc.dateOfBirth)
          /* idDocument: values.terraPayDetails.transaction.senderKyc.idDocument.map((doc) => ({
            ...doc,
            issueDate: updateDate(doc.issueDate),
            expiryDate: updateDate(doc.expiryDate),
          })), */
        },
        recipientKyc: {
          ...formik.values.terraPayDetails.transaction.recipientKyc,
          dateOfBirth: updateDate(formik.values.terraPayDetails.transaction.recipientKyc.dateOfBirth)
          /* idDocument: values.terraPayDetails.transaction.recipientKyc.idDocument.map((doc) => ({
            ...doc,
            issueDate: updateDate(doc.issueDate),
            expiryDate: updateDate(doc.expiryDate),
          })),*/
        }
      }
    }
  }

  function viewOTP(recId) {
    stack({
      Component: OTPPhoneVerification,
      props: {
        formValidation: formik,
        recordId: recId,
        functionId: SystemFunction.Outwards,
        onSuccess: () => {
          onClose(recId)
        }
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }
  async function getOutwards(recordId) {
    try {
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.get2,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  const onClose = async recId => {
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.close,
        record: JSON.stringify({
          recordId: formik.values.recordId ?? recId
        })
      })

      if (res.recordId) {
        if (recordId) toast.success(platformLabels.Closed)
        invalidate()
        refetchForm(res.recordId)
        await getDefaultVAT()
      }
    } catch (error) {}
  }

  const onReopen = async () => {
    try {
      const copy = { ...formik.values }
      delete copy.amountRows
      delete copy.instantCashDetails
      delete copy.terraPayDetails
      copy.date = formatDateToApi(copy.date)
      copy.valueDate = formatDateToApi(copy.valueDate)
      copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
      copy.expiryDate = formatDateToApi(copy.expiryDate)

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.reopen,
        record: JSON.stringify(copy)
      })

      if (res.recordId) {
        toast.success(platformLabels.Reopened)
        invalidate()

        refetchForm(res.recordId)
        await getDefaultVAT()
      }
    } catch (error) {}
  }

  const onPost = async () => {
    try {
      const copy = { ...formik.values }
      copy.date = formatDateToApi(copy.date)
      copy.valueDate = formatDateToApi(copy.valueDate)
      copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
      copy.expiryDate = formatDateToApi(copy.expiryDate)

      await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.post,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Posted)
      invalidate()
      window.close()
    } catch (error) {}
  }

  const vatAmount = (formik.values.commission * formik.values.vatRate) / 100

  const amount = parseFloat(formik.values.lcAmount + (formik.values.commission + vatAmount - formik.values.tdAmount))

  const receivedTotal = formik.values.amountRows.reduce((sumAmount, row) => {
    const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

    return sumAmount + curValue
  }, 0)

  const Balance = amount - receivedTotal

  const onProductSubmit = productData => {
    const selectedRowData = productData?.find(row => row.checked)
    handleSelectedProduct(selectedRowData)
  }
  function handleSelectedProduct(selectedRowData) {
    formik.setFieldValue('bankType', selectedRowData?.interfaceId)
    formik.setFieldValue('productId', selectedRowData?.productId)
    formik.setFieldValue('commission', selectedRowData?.fees)
    formik.setFieldValue('defaultCommission', selectedRowData?.fees)
    formik.setFieldValue('lcAmount', selectedRowData?.baseAmount)
    formik.setFieldValue('dispersalId', selectedRowData?.dispersalId)
    formik.setFieldValue('exRate', selectedRowData?.exRate)
    formik.setFieldValue('rateCalcMethod', selectedRowData?.rateCalcMethod)
    formik.setFieldValue('corId', selectedRowData?.corId)
    formik.setFieldValue('corRef', selectedRowData?.corRef)
    formik.setFieldValue('corName', selectedRowData?.corName)
    calculateValueDate(selectedRowData?.valueDays)
  }

  const fillOutwardsData = async data => {
    const modifiedList = data.cash.map((item, index) => ({
      ...item,
      id: index + 1,
      bankFees: item.bankFees ? parseFloat(item.bankFees).toFixed(2) : null,
      amount: parseFloat(item.amount).toFixed(2)
    }))
    formik.setValues({
      ...data.headerView,
      date: formatDateFromApi(data.headerView.date),
      defaultValueDate: formatDateFromApi(data.headerView.defaultValueDate),
      valueDate: formatDateFromApi(data.headerView.valueDate),
      ttNo: data.ttNo,
      bankType: data.headerView.interfaceId,
      amountRows: modifiedList
    })
  }

  function openRelevantWindow(formValues) {
    if (formValues.dispersalType === 1) {
      stack({
        Component: BenificiaryCashForm,
        props: {
          client: {
            clientId: formik.values.clientId,
            clientRef: formik.values.clientRef,
            clientName: formik.values.clientName
          },
          corId: formik.values.corId ? formik.values.corId : 0,
          countryId: formik.values.countryId,
          currencyId: formik.values.currencyId,
          beneficiary: { beneficiaryId: formik.values.beneficiaryId, beneficiarySeqNo: formik.values.beneficiarySeqNo },
          dispersalType: formik.values.dispersalType,
          onSuccess: (response, name) => HandleAddedBenificiary(response, name)
        },
        width: 700,
        height: 500,
        title: labels.cash
      })
    } else if (formValues.dispersalType === 2) {
      stack({
        Component: BenificiaryBankForm,
        props: {
          client: {
            clientId: formik.values.clientId,
            clientRef: formik.values.clientRef,
            clientName: formik.values.clientName
          },
          currencyId: formik.values.currencyId,
          dispersalType: formik.values.dispersalType,
          corId: formik.values.corId ? formik.values.corId : 0,
          countryId: formik.values.countryId,
          beneficiary: { beneficiaryId: formik.values.beneficiaryId, beneficiarySeqNo: formik.values.beneficiarySeqNo },
          onSuccess: (response, name) => HandleAddedBenificiary(response, name)
        },
        width: 900,
        height: 600,
        title: labels.bank
      })
    }
  }
  function HandleAddedBenificiary(response, name) {
    const [, beneficiaryId, seqNo] = response.split(',')
    formik.setFieldValue('beneficiaryId', beneficiaryId)
    formik.setFieldValue('beneficiaryName', name)
    formik.setFieldValue('beneficiarySeqNo', seqNo)
  }

  const chooseClient = async clientId => {
    try {
      if (clientId) {
        const res = await getRequest({
          extension: RTCLRepository.CtClientIndividual.get2,
          parameters: `_clientId=${clientId}`
        })
        formik.setFieldValue('idNo', res?.record?.clientIDView?.idNo)
        formik.setFieldValue('expiryDate', formatDateFromApi(res?.record?.clientIDView?.idExpiryDate))
        formik.setFieldValue('firstName', res?.record?.clientIndividual?.firstName)
        formik.setFieldValue('middleName', res?.record?.clientIndividual?.middleName)
        formik.setFieldValue('lastName', res?.record?.clientIndividual?.lastName)
        formik.setFieldValue('familyName', res?.record?.clientIndividual?.familyName)
        formik.setFieldValue('fl_firstName', res?.record?.clientIndividual?.fl_firstName)
        formik.setFieldValue('fl_middleName', res?.record?.clientIndividual?.fl_middleName)
        formik.setFieldValue('fl_lastName', res?.record?.clientIndividual?.fl_lastName)
        formik.setFieldValue('fl_familyName', res?.record?.clientIndividual?.fl_familyName)
        formik.setFieldValue('professionId', res?.record?.clientIndividual?.professionId)
        formik.setFieldValue('cellPhone', res?.record?.clientMaster?.cellPhone)
        formik.setFieldValue('nationalityId', res?.record?.clientMaster?.nationalityId)
        formik.setFieldValue('hiddenTrxCount', res?.record?.clientRemittance?.trxCountPerYear)
        formik.setFieldValue('hiddenTrxAmount', res?.record?.clientRemittance?.trxAmountPerYear)
        formik.setFieldValue('hiddenSponserName', res?.record?.clientIndividual?.sponsorName)
      }
    } catch (error) {}
  }

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
      disabled: !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Beneficiary',
      condition: true,
      onClick: () => openRelevantWindow(formik.values),
      disabled: formik.values.dispersalType && formik.values.clientId ? false : true
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !isPosted
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    }
  ]

  function openProductWindow() {
    stack({
      Component: ProductsWindow,
      props: {
        maxAccess: maxAccess,
        labels: labels,
        outWardsData: {
          plantId: formik.values.plantId,
          countryId: formik.values.countryId,
          currencyId: formik.values.currencyId,
          dispersalType: formik.values.dispersalType,
          fcAmount: formik.values.fcAmount,
          productId: formik.values.productId
        },
        onProductSubmit
      },
      width: 900,
      height: 500
    })
  }

  function openBankWindow() {
    if (formik.values.bankType === 1) {
      stack({
        Component: InstantCash,
        props: {
          onSubmit: onInstantCashSubmit,
          cashData: formik.values.instantCashDetails,
          outwardsData: {
            countryId: formik.values.countryId,
            amount: formik.values.amount
          },
          clientData: {
            hiddenTrxAmount: formik.values.hiddenTrxAmount,
            hiddenTrxCount: formik.values.hiddenTrxCount,
            hiddenSponserName: formik.values.hiddenSponserName
          }
        },
        width: 1000,
        height: 650,
        title: labels.instantCash
      })
    } else if (formik.values.bankType === 2) {
      stack({
        Component: TerraPay,
        props: {
          onSubmit: onTerraPaySubmit,
          terraPay: formik.values.terraPayDetails,
          outwardsData: {
            countryId: formik.values.countryId,
            amount: amount,
            currencyId: formik.values.currencyId,
            currencyRef: formik.values.currencyRef
          }
        },
        width: 700,
        height: 500,
        title: 'Terra Pay'
      })
    }
  }

  async function getDefaultVAT() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=vatPct`
      })
      formik.setFieldValue('vatRate', parseInt(res.record.value))
    } catch (error) {}
  }

  const getDefaultDT = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userId}&_functionId=${SystemFunction.Outwards}`
      })
      res.record ? formik.setFieldValue('dtId', res.record.dtId) : formik.setFieldValue('dtId', '')
    } catch (error) {
      formik.setFieldValue('dtId', '')
    }
  }

  function onInstantCashSubmit(obj) {
    formik.setFieldValue('instantCashDetails', obj)
  }

  function calculateValueDate(valueDays) {
    const newDate = new Date(formik.values.date)
    newDate.setDate(newDate.getDate() + valueDays)
    formik.setFieldValue('valueDate', newDate)
  }

  async function refetchForm(recordId) {
    const res = await getOutwards(recordId)
    await fillOutwardsData(res.record)
    await chooseClient(res.record.headerView.clientId)
  }

  async function checkProduct() {
    try {
      if (plantId && formik.values.countryId && formik.values.currencyId && formik.values.dispersalType) {
        var parameters = `_plantId=${plantId}&_countryId=${formik.values.countryId}&_dispersalType=${
          formik.values.dispersalType
        }&_currencyId=${formik.values.currencyId}&_amount=${formik.values.fcAmount || 0}`

        const res = await getRequest({
          extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
          parameters: parameters
        })
        if (res.list.length == 1) handleSelectedProduct(res.list[0])
      }
    } catch (error) {}
  }

  function onTerraPaySubmit(obj) {
    formik.setFieldValue('terraPayDetails', obj)
  }

  function terraPayFill(formFields) {
    console.log('inFunct')
    console.log(formik.values.terraPayDetails)
    formik.setFieldValue('terraPayDetails.quotation.debitorMSIDSN', formFields.cellPhone)
    formik.setFieldValue('terraPayDetails.quotation.requestAmount', formFields.amount)
    formik.setFieldValue('terraPayDetails.transaction.amount', formFields.amount)
    formik.setFieldValue('terraPayDetails.transaction.debitorMSIDSN', formFields.cellPhone)

    console.log('dateee', formik.values.terraPayDetails.quotation.requestDate)
    console.log(!/^\/Date\(/.test(formik.values.terraPayDetails.quotation.requestDate))
    if (
      formik.values.terraPayDetails.quotation.requestDate &&
      !/^\/Date\(/.test(formik.values.terraPayDetails.quotation.requestDate)
    ) {
      //CONDITION IS ENOUGH ON ONE DATE TO CHECK IF FORMATTED BEFORE
      formik.values.terraPayDetails.quotation.requestDate &&
        formik.setFieldValue(
          'terraPayDetails.quotation.requestDate',
          formatDateToApi(formik.values.terraPayDetails.quotation.requestDate)
        )
      formik.values.terraPayDetails.transaction.requestDate &&
        formik.setFieldValue(
          'terraPayDetails.transaction.requestDate',
          formatDateToApi(formik.values.terraPayDetails.transaction.requestDate)
        )
      formik.values.terraPayDetails.transaction.senderKyc.dateOfBirth &&
        formik.setFieldValue(
          'terraPayDetails.transaction.senderKyc.dateOfBirth',
          formatDateToApi(formik.values.terraPayDetails.transaction.senderKyc.dateOfBirth)
        )
      formik.values.terraPayDetails.transaction.senderKyc.idDocument.issueDate &&
        formik.setFieldValue(
          'terraPayDetails.transaction.senderKyc.idDocument.issueDate',
          formatDateToApi(formik.values.terraPayDetails.transaction.senderKyc.idDocument.issueDate)
        )
      formik.values.terraPayDetails.transaction.senderKyc.idDocument.expiryDate &&
        formik.setFieldValue(
          'terraPayDetails.transaction.senderKyc.idDocument.expiryDate',
          formatDateToApi(formik.values.terraPayDetails.transaction.senderKyc.idDocument.expiryDate)
        )
      formik.values.terraPayDetails.transaction.recipientKyc.dateOfBirth &&
        formik.setFieldValue(
          'terraPayDetails.transaction.recipientKyc.dateOfBirth',
          formatDateToApi(formik.values.terraPayDetails.transaction.recipientKyc.dateOfBirth)
        )
      formik.values.terraPayDetails.transaction.recipientKyc.idDocument.issueDate &&
        formik.setFieldValue(
          'terraPayDetails.transaction.recipientKyc.idDocument.issueDate',
          formatDateToApi(formik.values.terraPayDetails.transaction.recipientKyc.idDocument.issueDate)
        )
      formik.values.terraPayDetails.transaction.recipientKyc.idDocument.expiryDate &&
        formik.setFieldValue(
          'terraPayDetails.transaction.recipientKyc.idDocument.expiryDate',
          formatDateToApi(formik.values.terraPayDetails.transaction.recipientKyc.idDocument.expiryDate)
        )
    }

    console.log('last')
    console.log(formik.values.terraPayDetails)
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          await refetchForm(recordId)
        } else {
          await getDefaultDT()
        }
        await getDefaultVAT()
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.OutwardsTransfer}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      onClose={onClose}
      onReopen={onReopen}
      isClosed={isClosed}
      actions={actions}
      previewReport={editMode}
      functionId={SystemFunction.Outwards}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid container rowGap={2} xs={12} spacing={2} sx={{ px: 2, pb: 2 }}>
              <FormGrid item hideonempty xs={2.4}>
                <CustomTextField
                  name='reference'
                  label={labels.Reference}
                  value={formik?.values?.reference}
                  maxAccess={maxAccess}
                  maxLength='30'
                  readOnly={editMode}
                  onChange={formik.handleChange}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </FormGrid>
              <FormGrid item hideonempty xs={2.4}>
                <CustomDatePicker
                  name='date'
                  required
                  label={labels.date}
                  value={formik?.values?.date}
                  onChange={formik.setFieldValue}
                  editMode={editMode}
                  readOnly={isClosed || isPosted}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('date', '')}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                />
              </FormGrid>
              <FormGrid item hideonempty xs={2.4}>
                <ResourceComboBox
                  datasetId={DataSets.DOCUMENT_STATUS}
                  name='status'
                  label={labels.docStatus}
                  readOnly
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  onClear={() => formik.setFieldValue('status', '')}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('status', newValue?.key || '')
                  }}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                />
              </FormGrid>
              <FormGrid item hideonempty xs={2.4}>
                <CustomTextField
                  name='ttNo'
                  label={labels.ttNo}
                  value={formik.values?.ttNo}
                  readOnly
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('ttNo', '')}
                  error={formik.touched.ttNo && Boolean(formik.errors.ttNo)}
                  maxAccess={maxAccess}
                />
              </FormGrid>
              <FormGrid item hideonempty xs={2.4}>
                <CustomDatePicker
                  name='valueDate'
                  label={labels.valueDate}
                  value={formik?.values?.valueDate}
                  onChange={formik.setFieldValue}
                  readOnly={isClosed || isPosted}
                  required
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('valueDate', '')}
                  error={formik.touched.valueDate && Boolean(formik.errors.valueDate)}
                  helperText={formik.touched.valueDate && formik.errors.valueDate}
                />
              </FormGrid>
            </Grid>
            <Grid container rowGap={2} xs={4.5} sx={{ pt: 2 }}>
              <FieldSet title='Transaction Details'>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.Country.qry}
                    name='countryId'
                    label={labels.Country}
                    required
                    readOnly={isClosed || isPosted}
                    displayField={['countryRef', 'countryName']}
                    columnsInDropDown={[
                      { key: 'countryRef', value: 'Reference' },
                      { key: 'countryName', value: 'Name' }
                    ]}
                    valueField='countryId'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('countryId', newValue ? newValue?.countryId : '')
                      if (!newValue) {
                        formik.setFieldValue('dispersalType', '')
                        formik.setFieldValue('currencyId', '')
                        formik.setFieldValue('currencyRef', '')
                      }
                    }}
                    error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={formik.values.countryId && RemittanceOutwardsRepository.DispersalType.qry}
                    parameters={formik.values.countryId && `_countryId=${formik.values.countryId}`}
                    label={labels.DispersalType}
                    required
                    readOnly={isClosed || isPosted || !formik.values.countryId}
                    name='dispersalType'
                    displayField='dispersalTypeName'
                    valueField='dispersalType'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dispersalType', newValue ? newValue?.dispersalType : '')
                      formik.setFieldValue('dispersalTypeName', newValue ? newValue?.dispersalTypeName : '')
                      formik.setFieldValue('beneficiaryId', '')
                      formik.setFieldValue('beneficiaryName', '')
                      if (!newValue) {
                        formik.setFieldValue('currencyId', '')
                        formik.setFieldValue('currencyRef', '')
                      }
                    }}
                    error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={
                      formik.values.countryId &&
                      formik.values.dispersalType &&
                      RemittanceOutwardsRepository.Currency.qry
                    }
                    parameters={`_dispersalType=${formik.values.dispersalType}&_countryId=${formik.values.countryId}`}
                    label={labels.Currency}
                    required
                    name='currencyId'
                    displayField={['currencyRef', 'currencyName']}
                    columnsInDropDown={[
                      { key: 'currencyRef', value: 'Reference' },
                      { key: 'currencyName', value: 'Name' }
                    ]}
                    valueField='currencyId'
                    values={formik.values}
                    readOnly={!formik.values.dispersalType || isClosed || isPosted}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.currencyId)
                      formik.setFieldValue('currencyRef', newValue?.currencyRef)
                    }}
                    error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='fcAmount'
                    label={labels.fcAmount}
                    value={formik.values.fcAmount}
                    required
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('fcAmount', e.target.value)}
                    onBlur={async () => {
                      await checkProduct()
                    }}
                    onClear={() => formik.setFieldValue('fcAmount', '')}
                    error={formik.touched.fcAmount && Boolean(formik.errors.fcAmount)}
                    maxLength={10}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    sx={{ backgroundColor: '#908c8c', color: '#000000' }}
                    disabled={
                      !(plantId && formik.values.countryId && formik.values.currencyId && formik.values.dispersalType)
                    }
                    onClick={() => openProductWindow()}
                  >
                    Product
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='corId'
                    label={labels.Correspondant}
                    form={formik}
                    required={formik.values.corId}
                    displayFieldWidth={2}
                    valueShow='corRef'
                    secondValueShow='corName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    readOnly
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('corId', newValue ? newValue.recordId : null)
                      formik.setFieldValue('corName', newValue ? newValue.name : null)
                      formik.setFieldValue('corRef', newValue ? newValue.reference : null)
                    }}
                    errorCheck={'corId'}
                  />
                </Grid>
                <Grid container xs={12} spacing={1} sx={{ pt: 2, pl: 2 }}>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate'
                      label={labels.exchangeRate}
                      value={formik.values.exRate}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('exRate', e.target.value)}
                      onClear={() => formik.setFieldValue('exRate', '')}
                      error={formik.touched.exRate && Boolean(formik.errors.exRate)}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate2'
                      label={labels.exchangeRate}
                      value={formik.values?.exRate ? 1 / formik.values.exRate : ''}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('exRate2', e.target.value)}
                      onClear={() => formik.setFieldValue('exRate2', '')}
                      error={formik.touched.exRate2 && Boolean(formik.errors.exRate2)}
                      maxLength={10}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='lcAmount'
                    label={labels.lcAmount}
                    value={formik.values.lcAmount}
                    required
                    readOnly
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('lcAmount', e.target.value)}
                    onClear={() => formik.setFieldValue('lcAmount', '')}
                    error={formik.touched.lcAmount && Boolean(formik.errors.lcAmount)}
                    maxLength={10}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='commission'
                    label={labels.commission}
                    value={formik.values.commission}
                    required
                    readOnly
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('commission', '')}
                    error={formik.touched.commission && Boolean(formik.errors.commission)}
                    onChange={e => {
                      formik.setFieldValue('commission', e.target.value)
                    }}
                    maxLength={10}
                  />
                </Grid>
                <Grid container xs={12} spacing={1} sx={{ pt: 2, pl: 2 }}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='vatAmount'
                      label={labels.vatRate}
                      value={vatAmount}
                      readOnly
                      maxAccess={maxAccess}
                      maxLength={10}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='tdAmount'
                    label={labels.discount}
                    value={formik.values.tdAmount}
                    maxAccess={maxAccess}
                    onChange={e => {
                      formik.setFieldValue('tdAmount', e.target.value)
                    }}
                    onClear={() => formik.setFieldValue('tdAmount', 0)}
                    error={formik.touched.tdAmount && Boolean(formik.errors.tdAmount)}
                    maxLength={10}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='amount'
                    label={labels.NetToPay}
                    value={amount}
                    required
                    readOnly
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('amount', amount)}
                    onClear={() => formik.setFieldValue('amount', '')}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    maxLength={10}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label='Amount Recieved' value={getFormattedNumber(receivedTotal)} readOnly />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField label='Balance To Pay' value={getFormattedNumber(Balance) ?? '0'} readOnly />
                </Grid>
              </FieldSet>
            </Grid>
            <Grid container rowGap={2} xs={7.5} sx={{ pt: 2 }}>
              <FieldSet title='Client Details'>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={CTCLRepository.ClientCorporate.snapshot}
                    parameters={{
                      _category: 0
                    }}
                    valueField='reference'
                    displayField='name'
                    name='clientId'
                    label={labels.Client}
                    form={formik}
                    required
                    readOnly={isClosed || isPosted}
                    displayFieldWidth={2}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    onChange={async (event, newValue) => {
                      if (newValue?.status == -1) {
                        stackError({
                          message: `Chosen Client Must Be Active.`
                        })

                        return
                      }
                      formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('clientName', newValue ? newValue.name : '')
                      formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                      await chooseClient(newValue?.recordId)
                      formik.setFieldValue('beneficiaryId', '')
                      formik.setFieldValue('beneficiaryName', '')
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid container xs={12} spacing={2} sx={{ pl: '10px', pt: 1 }}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='firstName'
                      label={labels.firstName}
                      value={formik.values?.firstName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      onClear={() => formik.setFieldValue('firstName', '')}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='middleName'
                      label={labels.middleName}
                      value={formik.values?.middleName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      onClear={() => formik.setFieldValue('middleName', '')}
                      error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='lastName'
                      label={labels.lastName}
                      value={formik.values?.lastName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      onClear={() => formik.setFieldValue('lastName', '')}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='familyName'
                      label={labels.familyName}
                      value={formik.values?.familyName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      onClear={() => formik.setFieldValue('familyName', '')}
                      error={formik.touched.familyName && Boolean(formik.errors.familyName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                </Grid>
                <Grid container xs={12} spacing={2} sx={{ flexDirection: 'row-reverse', pl: '10px', pt: 1 }}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_firstName'
                      label={labels.flFirstName}
                      value={formik.values?.fl_firstName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_firstName', '')}
                      error={formik.touched.fl_firstName && Boolean(formik.errors.fl_firstName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_middleName'
                      label={labels.flMiddleName}
                      value={formik.values?.fl_middleName}
                      readOnly
                      maxLength='20'
                      onChange={formik.handleChange}
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_familyName', '')}
                      error={formik.touched.fl_middleName && Boolean(formik.errors.fl_middleName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_lastName'
                      label={labels.flLastName}
                      value={formik.values?.fl_lastName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_lastName', '')}
                      error={formik.touched.fl_lastName && Boolean(formik.errors.fl_lastName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_familyName'
                      label={labels.flFamilyName}
                      value={formik.values?.fl_familyName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_familyName', '')}
                      error={formik.touched.fl_familyName && Boolean(formik.errors.fl_familyName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                </Grid>
                <Grid container xs={12} sx={{ pt: 1, pl: 2 }}>
                  {/* First Column */}
                  <Grid container rowGap={2} xs={6} sx={{ px: 1 }}>
                    <Grid item xs={6}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Country.qry}
                        label={labels.Nationality}
                        name='nationalityId'
                        displayField={['reference', 'name']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        valueField='recordId'
                        values={formik.values}
                        readOnly
                        error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ pl: 2 }}>
                      <CustomTextField
                        name='idNo'
                        label={labels.IdNo}
                        value={formik.values.idNo}
                        onChange={formik.handleChange}
                        readOnly
                        onClear={() => formik.setFieldValue('idNo', '')}
                        error={formik.touched.idNo && Boolean(formik.errors.idNo)}
                        helperText={formik.touched.idNo && formik.errors.idNo}
                        maxLength='15'
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomDatePicker
                        name='expiryDate'
                        label={labels.expiryDate}
                        value={formik.values?.expiryDate}
                        readOnly
                        error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ pl: 2 }}>
                      <CustomTextField
                        name='cellPhone'
                        phone={true}
                        label={labels.cellPhone}
                        value={formik.values?.cellPhone}
                        readOnly
                        onChange={formik.handleChange}
                        maxLength='15'
                        autoComplete='off'
                        onBlur={e => {
                          formik.handleBlur(e)
                        }}
                        onClear={() => formik.setFieldValue('cellPhone', '')}
                        error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                        helperText={formik.touched.cellPhone && formik.errors.cellPhone}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <ResourceComboBox
                        endpointId={RemittanceSettingsRepository.Profession.qry}
                        label={labels.profession}
                        name='professionId'
                        displayField={['reference', 'name']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        valueField='recordId'
                        values={formik.values}
                        readOnly
                        error={formik.touched.professionId && Boolean(formik.errors.professionId)}
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ pl: 2 }}>
                      <CustomTextField
                        name='giftCode'
                        label={labels.giftCode}
                        value={formik.values?.giftCode}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('giftCode', '')}
                        error={formik.touched.giftCode && Boolean(formik.errors.giftCode)}
                        maxAccess={maxAccess}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                        name='poeId'
                        label={labels.purposeOfExchange}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        values={formik.values}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('poeId', newValue ? newValue?.recordId : '')
                        }}
                        required
                        error={formik.touched.poeId && Boolean(formik.errors.poeId)}
                        helperText={formik.touched.poeId && formik.errors.poeId}
                      />
                    </Grid>
                  </Grid>
                  {/* Second Column */}
                  <Grid container rowGap={2} xs={6}>
                    <Grid item xs={12}>
                      <CustomTextArea
                        name='details'
                        label={labels.details}
                        value={formik.values.details}
                        rows={3}
                        maxLength='100'
                        editMode={editMode}
                        maxAccess={maxAccess}
                        onChange={e => formik.setFieldValue('details', e.target.value)}
                        onClear={() => formik.setFieldValue('details', '')}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </FieldSet>
              <Grid item xs={5} sx={{ pl: 5 }}>
                <ResourceLookup
                  endpointId={RemittanceOutwardsRepository.Beneficiary.snapshot}
                  parameters={{
                    _clientId: formik.values.clientId,
                    _dispersalType: formik.values.dispersalType,
                    _currencyId: formik.values.currencyId
                  }}
                  valueField='name'
                  displayField='name'
                  name='beneficiaryName'
                  label={labels.Beneficiary}
                  form={formik}
                  columnsInDropDown={[
                    { key: 'name', value: 'Name' },
                    { key: 'shortName', value: 'ShortName' }
                  ]}
                  required
                  readOnly={!formik.values.clientId || !formik.values.dispersalType || isClosed || isPosted}
                  maxAccess={maxAccess}
                  editMode={editMode}
                  secondDisplayField={false}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('beneficiaryId', newValue?.beneficiaryId)
                    formik.setFieldValue('beneficiaryName', newValue?.name)
                    formik.setFieldValue('beneficiarySeqNo', newValue?.seqNo)
                  }}
                  errorCheck={'beneficiaryId'}
                />
              </Grid>
              <Grid item xs={2} sx={{ pl: 2 }}>
                <Button
                  sx={{
                    backgroundColor: '#908c8c',
                    color: '#000000',
                    '&:disabled': {
                      backgroundColor: '#eaeaea',
                      color: '#000000'
                    }
                  }}
                  disabled={!formik.values.beneficiaryId}
                  onClick={() => openBankWindow()}
                >
                  Bank API
                </Button>
              </Grid>

              <Grid container>
                <FieldSet title='Amount'>
                  <Grid width={'100%'}>
                    <DataGrid
                      onChange={value => formik.setFieldValue('amountRows', value)}
                      value={formik.values.amountRows}
                      error={formik.errors.amountRows}
                      disabled={isClosed}
                      allowAddNewLine={!isClosed}
                      allowDelete={!isClosed}
                      maxAccess={maxAccess}
                      name='amountRows'
                      height={170}
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
                            ]
                          }
                        },
                        {
                          component: 'numberfield',
                          name: 'amount',
                          label: labels.Amount,
                          defaultValue: ''
                        },
                        {
                          component: 'resourcecombobox',
                          name: 'ccName',
                          editable: false,
                          label: labels.creditCard,
                          props: {
                            endpointId: CashBankRepository.CreditCard.qry,
                            valueField: 'recordId',
                            displayField: 'name',
                            mapping: [
                              { from: 'recordId', to: 'ccId' },
                              { from: 'name', to: 'ccName' }
                            ],
                            columnsInDropDown: [
                              { key: 'reference', value: 'Reference' },
                              { key: 'name', value: 'Name' }
                            ],
                            displayFieldWidth: 2
                          }
                        },
                        {
                          component: 'numberfield',
                          header: labels.bankFees,
                          name: 'bankFees',
                          label: labels.bankFees
                        },
                        {
                          component: 'textfield',
                          header: labels.receiptRef,
                          name: 'receiptRef',
                          label: labels.receiptRef
                        }
                      ]}
                    />
                  </Grid>
                </FieldSet>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
