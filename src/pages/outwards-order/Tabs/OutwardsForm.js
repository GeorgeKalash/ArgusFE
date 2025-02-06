import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
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
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useForm } from 'src/hooks/form'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import BeneficiaryListWindow from '../Windows/BeneficiaryListWindow'
import { getStorageData } from 'src/storage/storage'
import ReceiptVoucherForm from 'src/pages/rt-receipt-vouchers/forms/ReceiptVoucherForm'
import CustomSwitch from 'src/components/Inputs/CustomSwitch'
import CustomButton from 'src/components/Inputs/CustomButton'

export default function OutwardsForm({ labels, access, recordId, plantId, userId, dtId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const userData = getStorageData('userData')

  const [sysDefault, setDefault] = useState({ countryRef: 'AE', currencyRef: 'AED' })

  const { labels: RVLabels, access: RVAccess } = useResourceQuery({
    datasetId: ResourceIds.RemittanceReceiptVoucher
  })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.OutwardsOrder,
    access,
    hasDT: false
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsOrder.snapshot
  })

  const initialValues = {
    idNo: '',
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
    recordId: recordId,
    header: {
      countryName: '',
      countryRef: '',
      currencyRef: '',
      dispersalName: '',
      dispersalRef: '',
      currencyName: '',
      currentIsoCode: '',
      countryIsoCode: ' ',
      corRef: null,
      corName: null,
      clientRef: '',
      clientName: '',
      cellPhone: '',
      statusName: '',
      wipName: '',
      rsName: null,
      beneficiaryName: '',
      plantName: null,
      plantRef: null,
      cashAccountRef: null,
      cashAccountName: null,
      poeName: '',
      poeRef: '',
      productName: '',
      interfaceId: '',
      wfStatusName: '',
      plantId: plantId,
      userId: userId,
      countryId: '',
      lcAmount: '',
      corId: null,
      rateCalcMethod: null,
      dispersalType: null,
      currencyId: null,
      wip: 1,
      productId: '',
      dispersalId: '',
      clientId: '',
      category: '',
      beneficiaryId: '',
      beneficiarySeqNo: '',
      fcAmount: 0,
      exRate: 1,
      commission: '',
      valueDate: new Date(),
      defaultValueDate: new Date(),
      vatAmount: null,
      tdAmount: 0,
      defaultCommission: 12,
      amount: 0,
      taxPercent: null,
      poeId: '',
      nationalityId: null,
      receiptId: null,
      wfStatus: 1,
      rateTypeId: 1,
      includingFees: false,
      dtId: dtId || null,
      batchId: null,
      reference: '',
      status: 1,
      releaseStatus: null,
      date: new Date(),
      isVerified: null,
      recordId: recordId || null,
      includingFees: false //test
    },

    bankType: '',
    products: [{}],
    ICRequest: [{}],

    tokenNo: '',
    vatRate: null,
    giftCode: '',
    details: '',
    hiddenTrxAmount: '',
    hiddenTrxCount: '',
    agentCode: 'AE01BH',
    terraPayDetails: {
      quotation: {
        requestDate: new Date(),
        debitorMSIDSN: '',
        creditorMSIDSN: '',
        creditorBankAccount: '',
        creditorReceivingCountry: '',
        requestAmount: '',
        requestCurrency: '',
        sendingCurrency: '',
        receivingCurrency: ''
      },
      transaction: {
        amount: '',
        currency: '',
        type: 'inttransfer',
        descriptionText: '',
        requestDate: new Date(),
        requestingOrganisationTransactionReference: '',
        debitorMSIDSN: '',
        creditorBankAccount: '',
        creditorSortCode: '0001',
        creditorBankSubCode: '',
        creditorAccounttype: 'Savings',
        senderKyc: {
          nationality: '',
          dateOfBirth: '',
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
          dateOfBirth: '',
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
      header: yup.object({
        valueDate: yup.string().required(),
        countryId: yup.string().required(),
        dispersalType: yup.string().required(),
        currencyId: yup.string().required(),
        fcAmount: yup.string().required(),
        productId: yup.string().required(),
        commission: yup.string().required(),
        lcAmount: yup.string().required(),
        exRate: yup.string().required(),
        clientId: yup.string().required(),
        poeId: yup.string().required(),
        beneficiaryId: yup.string().required(),
        tdAmount: yup.number().test(`isCommission less than tdAmount`, `Error`, function (value) {
          const { commission } = this.parent

          return value <= commission
        })
      })
    }),
    onSubmit: async values => {
      const data = {
        header: {
          ...values.header,
          date: formatDateToApi(values.header?.date),
          valueDate: formatDateToApi(values.header?.valueDate),
          defaultValueDate: formatDateToApi(values.header?.defaultValueDate)
        },
        bankType: values.bankType,
        ICRequest: values.bankType && values.ICRequest?.deliveryModeId ? values.ICRequest : null,
        TPRequest: values.bankType === 2 ? values.terraPayDetails : {}
      }

      const result = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsOrder.set2,
        record: JSON.stringify(data)
      })

      if (result.recordId) {
        toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
        formik.setFieldValue('header.recordId', result.recordId)
        formik.setFieldValue('recordId', result.recordId)
        const res2 = await getOutwards(result.recordId)
        formik.setFieldValue('header.reference', res2.record.headerView.reference)

        invalidate()
      }
    }
  })

  const editMode = !!formik.values.header.recordId
  const isClosed = formik.values.header.wip === 2
  const isPosted = formik.values.header.status === 3

  const getCashAccountId = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData?.userId}&_key=cashAccountId`
    })

    return res?.record?.value
  }

  async function getOutwards(recordId) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.get2,
      parameters: `_recordId=${recordId}`
    })
  }

  const onClose = async recId => {
    await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.close,
      record: JSON.stringify({
        recordId: formik.values.header.recordId ?? recId
      })
    }).then(async res => {
      if (res.recordId) {
        if (recordId) toast.success(platformLabels.Closed)
        invalidate()
        refetchForm(res.recordId)
        await getDefaultVAT()
        const result = await getOutwards(res.recordId)
        result.record.headerView.status === 4 && openRV()
      }
    })
  }

  const onReopen = async () => {
    const copy = { ...formik.values }
    delete copy.instantCashDetails
    copy.header.date = formatDateToApi(copy.date)
    copy.header.valueDate = formatDateToApi(copy.valueDate)
    copy.header.defaultValueDate = formatDateToApi(copy.defaultValueDate)
    copy.header.expiryDate = formatDateToApi(copy.expiryDate)

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.reopen,
      record: JSON.stringify(copy)
    })

    if (res.recordId) {
      toast.success(platformLabels.Reopened)
      invalidate()

      refetchForm(res.recordId)
      await getDefaultVAT()
    }
  }

  const vatAmount = (formik.values.header?.commission * formik.values.header.vatRate) / 100

  const amount = parseFloat(
    parseFloat(formik.values.header.lcAmount) +
      (formik.values.header.commission + vatAmount - formik.values.header.tdAmount)
  )

  const onProductSubmit = productData => {
    formik.setFieldValue('products', productData?.list)
    const selectedRowData = productData?.list?.find(row => row.checked)
    handleSelectedProduct(selectedRowData)
  }

  function handleSelectedProduct(selectedRowData, clearAmounts) {
    formik.setFieldValue('bankType', selectedRowData?.interfaceId)
    formik.setFieldValue('header.productId', selectedRowData?.productId)
    formik.setFieldValue('header.commission', selectedRowData?.fees)
    formik.setFieldValue('header.defaultCommission', selectedRowData?.fees)
    formik.setFieldValue('header.dispersalId', selectedRowData?.dispersalId)
    formik.setFieldValue('header.exRate', parseFloat(selectedRowData?.exRate).toFixed(5))
    formik.setFieldValue('header.rateCalcMethod', selectedRowData?.rateCalcMethod)
    selectedRowData?.agentCode && formik.setFieldValue('agentCode', selectedRowData?.agentCode)
    formik.setFieldValue('header.corId', selectedRowData?.corId)
    formik.setFieldValue('header.corRef', selectedRowData?.corRef)
    formik.setFieldValue('header.corName', selectedRowData?.corName)
    formik.setFieldValue('header.rateTypeId', selectedRowData?.rateTypeId)
    calculateValueDate(selectedRowData?.valueDays)
    if (clearAmounts) {
      formik.setFieldValue('header.lcAmount', '')
      formik.setFieldValue('header.fcAmount', '')
    } else {
      formik.setFieldValue('header.lcAmount', formik.values.header.lcAmount || selectedRowData?.baseAmount)
      formik.setFieldValue('header.fcAmount', formik.values.header.fcAmount || selectedRowData?.originAmount)
    }
  }

  const fillOutwardsData = async data => {
    formik.setValues(prevValues => ({
      ...prevValues,
      bankType: data.headerView.interfaceId,
      products: prevValues.products,
      recordId: data?.headerView.recordId,
      header: {
        ...data?.headerView,
        valueDate: formatDateFromApi(data?.headerView.valueDate),
        defaultValueDate: formatDateFromApi(data?.headerView.defaultValueDate),
        date: formatDateFromApi(data?.headerView.date)
      },
      ICRequest: data?.ICRequest
    }))
  }

  function openRelevantWindow(formValues) {
    if (formValues.dispersalType === 1) {
      stack({
        Component: BenificiaryCashForm,
        props: {
          client: {
            clientId: formik.values.header.clientId,
            clientRef: formik.values.header.clientRef,
            clientName: formik.values.header.clientName
          },
          corId: formik.values.header.corId ? formik.values.header.corId : 0,
          countryId: formik.values.header.countryId,
          currencyId: formik.values.header.currencyId,
          beneficiary: { beneficiaryId: formik.values.beneficiaryId, beneficiarySeqNo: formik.values.beneficiarySeqNo },
          dispersalType: formik.values.header.dispersalType,
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
            clientId: formik.values.header.clientId,
            clientRef: formik.values.header.header.clientRef,
            clientName: formik.values.header.clientName
          },
          currencyId: formik.values.header.currencyId,
          dispersalType: formik.values.header.dispersalType,
          corId: formik.values.header.corId ? formik.values.header.corId : 0,
          countryId: formik.values.header.countryId,
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
    formik.setFieldValue('header.beneficiaryId', beneficiaryId)
    formik.setFieldValue('header.beneficiaryName', name)
    formik.setFieldValue('header.beneficiarySeqNo', seqNo)
  }

  const getClientInfo = async clientId => {
    const res = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get2,
      parameters: `_clientId=${clientId}`
    })

    return res.record
  }

  const chooseClient = async (clientId, category) => {
    if (clientId) {
      if (category == 1) {
        const result = await getClientInfo(clientId)
        if (!result?.clientRemittance) {
          stackError({
            message: `Chosen Client Has No KYC.`
          })

          return
        }
        formik.setFieldValue('idNo', result?.clientIDView?.idNo)
        formik.setFieldValue('expiryDate', formatDateFromApi(result?.clientIDView?.idExpiryDate))
        formik.setFieldValue('firstName', result?.clientIndividual?.firstName)
        formik.setFieldValue('middleName', result?.clientIndividual?.middleName)
        formik.setFieldValue('lastName', result?.clientIndividual?.lastName)
        formik.setFieldValue('familyName', result?.clientIndividual?.familyName)
        formik.setFieldValue('fl_firstName', result?.clientIndividual?.fl_firstName)
        formik.setFieldValue('fl_middleName', result?.clientIndividual?.fl_middleName)

        formik.setFieldValue('fl_lastName', result?.clientIndividual?.fl_lastName)
        formik.setFieldValue('fl_familyName', result?.clientIndividual?.fl_familyName)
        formik.setFieldValue('professionId', result?.clientIndividual?.professionId)
        formik.setFieldValue('header.cellPhone', result?.clientMaster?.cellPhone)
        formik.setFieldValue('header.nationalityId', result?.clientMaster?.nationalityId)
        formik.setFieldValue('hiddenTrxCount', result?.clientRemittance?.trxCountPerYear)
        formik.setFieldValue('hiddenTrxAmount', result?.clientRemittance?.trxAmountPerYear)
        formik.setFieldValue('ICRequest.remitter.employerName', result?.clientIndividual?.sponsorName)
      } else if (category == 2) {
        const res = await getRequest({
          extension: CTCLRepository.ClientCorporate.get,
          parameters: `_clientId=${clientId}`
        })
        if (!res) {
          return
        }
        formik.setFieldValue('header.nationalityId', result?.clientMaster?.nationalityId)
        formik.setFieldValue('header.cellPhone', result?.clientMaster?.cellPhone)
        formik.setFieldValue('expiryDate', formatDateFromApi(result?.clientMaster?.expiryDate))
      }
    }
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
      key: 'BeneficiaryList',
      condition: true,
      onClick: openBeneficiaryWindow,
      disabled: editMode
        ? editMode
        : !(formik.values.countryId && formik.values.dispersalType && formik.values.clientId)
    },
    {
      key: 'Beneficiary',
      condition: true,
      onClick: () => openRelevantWindow(formik.values),
      disabled: formik.values.dispersalType && formik.values.clientId ? false : true
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      valuesPath: formik.values.header,
      disabled: !editMode
    },
    {
      key: 'Receipt Voucher',
      condition: true,
      onClick: openRV,
      disabled: !(formik.values.status == 4)
    }
  ]
  function openBeneficiaryWindow() {
    stack({
      Component: BeneficiaryListWindow,
      props: {
        form: formik,
        labels,
        maxAccess
      },
      width: 1300,
      height: 500,
      title: labels.beneficiaryList
    })
  }

  function openProductWindow() {
    stack({
      Component: ProductsWindow,
      props: {
        maxAccess: maxAccess,
        labels: labels,
        products: formik.values.products,
        countryRef: formik.values.header.countryRef,
        targetCurrency: formik.values.header.currencyRef,
        defaultAgentCode: formik.values.agentCode,
        fcAmount: formik.values.header.fcAmount,
        lcAmount: formik.values.header.lcAmount,
        productId: formik.values.header.productId,
        sysDefault,
        onProductSubmit,
        editMode
      },
      width: 900,
      height: 500
    })
  }

  function openBankWindow() {
    if (formik.values.bankType === 1) {
      const remitter = formik.values.ICRequest.remitter
      const beneficiary = formik.values.ICRequest.beneficiary
      const selectRow = formik.values?.products?.find(row => row.checked)

      stack({
        Component: InstantCash,
        props: {
          onSubmit: onInstantCashSubmit,
          cashData: formik.values.ICRequest,
          outwardsData: {
            countryId: formik.values.header.countryId,
            amount: formik.values.header.amount || amount
          },
          sysDefault,
          agentCode: formik.values.agentCode,
          deliveryModeId: selectRow?.deliveryModeId,
          payingAgent: selectRow?.agentCode,
          payingCurrency: selectRow?.payingCurrency,
          clientData: {
            hiddenTrxAmount: formik.values.hiddenTrxAmount,
            hiddenTrxCount: formik.values.hiddenTrxCount,
            bankDetails: beneficiary?.bankDetails,
            postCode: beneficiary?.address.postCode,
            relation: remitter?.relation,
            otherRelation: remitter?.otherRelation,
            employerName: remitter?.employerName,
            employerStatus: remitter?.employerStatus
          }
        },
        width: 740,
        height: 320,
        title: labels.instantCash
      })
    } else if (formik.values.bankType === 2) {
      stack({
        Component: TerraPay,
        props: {
          onSubmit: onTerraPaySubmit,
          terraPay: formik.values.terraPayDetails,
          outwardsData: {
            countryId: formik.values.header.countryId,
            countryRef: formik.values.header.countryRef,
            amount: amount,
            currencyId: formik.values.header.currencyId,
            currencyRef: formik.values.header.currencyRef
          },
          beneficiary: {
            beneficiaryName: formik.values.header.beneficiaryName
          }
        },
        width: 700,
        height: 500,
        title: labels.terraPay
      })
    }
  }

  async function onTerraPaySubmit(values) {
    const data = {
      quotation: {
        ...values.quotation,
        debitorMSIDSN: formik.values.header?.cellPhone,
        sendingCurrency: sysDefault?.currencyRef,
        receivingCurrency: values.quotation?.requestCurrency
      },
      transaction: {
        ...values.transaction,
        amount: values.quotation?.requestAmount,
        currency: values.quotation?.requestCurrency,
        type: 'inttransfer', // fawzy
        descriptionText: '',
        requestingOrganisationTransactionReference: 't11', // fawzy
        debitorMSIDSN: formik.values.header?.cellPhone,
        creditorBankAccount: values?.quotation.creditorBankAccount,
        creditorAccounttype: 'checking', // beneficiary  // fawzy
        internationalTransferInformation: {
          ...values.transaction.internationalTransferInformation,
          quoteId: '',
          receivingCountry: formik.values.header?.countryRef,
          sourceOfFunds: 'Salary',
          relationshipSender: values.transaction.internationalTransferInformation.relationshipSender
        }
      }
    }

    formik.setFieldValue('terraPayDetails', data)
  }

  async function openRV() {
    window.close()
    const cashAccountId = await getCashAccountId()
    stack({
      Component: ReceiptVoucherForm,
      props: {
        labels: RVLabels,
        maxAccess: RVAccess,
        recordId: formik.values.header.receiptId || '',
        cashAccountId: cashAccountId,
        form: formik.values.header?.receiptId ? null : formik.values.header
      },
      width: 1200,
      height: 500,
      title: RVLabels.receiptVoucher
    })
  }

  async function getDefaultVAT() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=vatPct`
    })
    formik.setFieldValue('header.vatRate', parseInt(res.record.value))
    formik.setFieldValue('header.taxPercent', parseFloat(res.record.value))
  }

  async function getDefaultCountry() {
    const countryId = defaultsData?.list?.find(({ key }) => key === 'countryId')?.value

    const countryRef = await getRequest({
      extension: SystemRepository.Country.get,
      parameters: `_recordId=${countryId}`
    })

    return countryRef.record.reference
  }

  async function getDefaultCurrency() {
    const currencyId = defaultsData?.list?.find(({ key }) => key === 'baseCurrencyId')?.value

    const currencyRef = await getRequest({
      extension: SystemRepository.Currency.get,
      parameters: `_recordId=${currencyId}`
    })

    return currencyRef.record.reference
  }

  function onInstantCashSubmit(obj) {
    formik.setFieldValue('ICRequest', obj)
    formik.setFieldValue('header.amount', obj.sourceAmount)
  }

  function calculateValueDate(valueDays) {
    const newDate = new Date(formik.values.date)
    newDate.setDate(newDate.getDate() + valueDays)
    formik.setFieldValue('valueDate', newDate)
  }

  async function mergeICRates(data, outwardsList) {
    const sysCountryRef = sysDefault?.countryRef
    const srcCurrency = sysDefault?.currencyRef
    const targetCurrency = formik.values.header.currencyRef || outwardsList.currencyRef
    const srcAmount = outwardsList?.lcAmount || formik.values.lcAmount || 0
    const trgtAmount = outwardsList?.fcAmount || formik.values.fcAmount || 0
    const countryRef = formik.values.header.countryRef || outwardsList.countryRef

    // try {
    //   const getRates = await getRequest({
    //     extension: RemittanceBankInterface.InstantCashRates.get,
    //     parameters: `_deliveryMode=${DEFAULT_DELIVERYMODE}&_sourceCurrency=${srcCurrency}&_targetCurrency=${targetCurrency}&_sourceAmount=${srcAmount}&_targetAmount=${trgtAmount}&_originatingCountry=${sysCountryRef}&_destinationCountry=${countryRef}`
    //   })

    //   const updateICProduct = (product, matchingRate) => {
    //     if (matchingRate) {
    //       return {
    //         ...product,
    //         fees: matchingRate.charge,
    //         exRate: matchingRate.settlementRate
    //       }
    //     }

    //     return product
    //   }

    //   if (getRates?.record) {
    //     if (data.length === 1) {
    //       const updatedProduct = updateICProduct(data[0], getRates.record)

    //       if (matchingRate) {
    //         if (formik.values.lcAmount) formik.setFieldValue('fcAmount', matchingRate.originAmount)
    //         if (formik.values.fcAmount) formik.setFieldValue('lcAmount', matchingRate.baseAmount)
    //       }

    //       !editMode && handleSelectedProduct(updatedProduct)
    //       formik.setFieldValue('products', [updatedProduct])
    //       formik.setFieldValue('products[0].checked', true)
    //     } else {
    //       !editMode && handleSelectedProduct()

    //       const updatedData = data.map(item =>
    //         item.interfaceId === 1
    //           ? updateICProduct(
    //               item,
    //               getRates.list.find(
    //                 rate => item.originAmount >= rate.amountRangeFrom && item.originAmount <= rate.amountRangeTo
    //               )
    //             )
    //           : item
    //       )

    //       formik.setFieldValue('products', updatedData)
    //       const matchedIndex = updatedData.findIndex(product => product.productId === data.productId)
    //       if (matchedIndex) {
    //         formik.setFieldValue(`products[${matchedIndex}].checked`, true)
    //       }
    //     }
    //   } else {
    //     displayProduct(data, data.productId)
    //   }
    // } catch (error) {
    //   await displayProduct(data, data.productId)
    // }
  }

  async function refetchForm(recordId) {
    const res = await getOutwards(recordId)
    await fillOutwardsData(res.record)
    await chooseClient(res.record.headerView.clientId, res.record.headerView.category)

    return res
  }

  async function fillProducts(data) {
    try {
      if (!data?.fcAmount && !data?.lcAmount) {
        return
      }
      if (plantId && data?.countryId && data?.currencyId && data?.dispersalType) {
        formik.setFieldValue('products', [])

        var parameters = `_plantId=${plantId}&_countryId=${data.countryId}&_dispersalType=${
          data.dispersalType
        }&_currencyId=${data?.currencyId}&_fcAmount=${data?.fcAmount}&_lcAmount=${
          data?.recordId ? 0 : data?.lcAmount
        }&_includingFees=${data?.includingFees ? 1 : 0}`

        const res = await getRequest({
          extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
          parameters: parameters
        })

        if (res?.list?.length > 0) {
          formik.setFieldValue('products', res.list)

          await displayProduct(res.list, data.header?.productId)
        } else {
          formik.setFieldValue('products', [])
          handleSelectedProduct()
        }
      }
    } catch (error) {
      formik.setFieldValue('products', [])
      handleSelectedProduct()
    }
  }

  useEffect(() => {
    ;(async function () {
      const countryRef = await getDefaultCountry()
      const currencyRef = await getDefaultCurrency()

      setDefault({ countryRef, currencyRef })
    })()
  }, [])

  async function displayProduct(data, productId) {
    if (data.length === 1) {
      formik.setFieldValue('products[0].checked', true)
      !editMode && handleSelectedProduct(data[0])
    } else {
      !editMode && handleSelectedProduct()
      if (productId) {
        const matchedIndex = data.findIndex(product => product.productId === productId)
        if (matchedIndex) formik.setFieldValue(`products[${matchedIndex}].checked`, true)
      }
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await refetchForm(recordId)
        const copy = { ...res.record }
        copy.lcAmount = 0
        await fillProducts(copy.headerView)
      }
      await getDefaultVAT()
    })()
  }, [])

  useEffect(() => {
    formik.setFieldValue('header.amount', amount)
    formik.setFieldValue('header.vatAmount', vatAmount)
  }, [amount])

  return (
    <FormShell
      resourceId={ResourceIds.OutwardsOrder}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      onClose={onClose}
      onReopen={onReopen}
      isClosed={isClosed}
      actions={actions}
      previewReport={editMode}
      functionId={SystemFunction.OutwardsOrder}
      disabledSubmit={isClosed || editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container xs={12} spacing={2}>
            <FormGrid item hideonempty xs={2}>
              <CustomTextField
                name='reference'
                label={labels.Reference}
                value={formik?.values?.header.reference}
                maxAccess={!editMode && maxAccess}
                maxLength='30'
                readOnly={editMode}
                onChange={formik.handleChange}
                error={formik.touched.header?.reference && Boolean(formik.errors.header?.reference)}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={2}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.header?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={isClosed || isPosted || editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.date', '')}
                error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={2}>
              <ResourceComboBox
                datasetId={DataSets.DOCUMENT_STATUS}
                name='status'
                label={labels.docStatus}
                readOnly
                valueField='key'
                displayField='value'
                values={formik.values.header}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={2}>
              <CustomDatePicker
                name='valueDate'
                label={labels.valueDate}
                value={formik?.values?.header.valueDate}
                onChange={formik.setFieldValue}
                readOnly={isClosed || isPosted || editMode}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.valueDate', '')}
                error={formik.touched.header?.valueDate && Boolean(formik.errors.header?.valueDate)}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={2}>
              <ResourceComboBox
                datasetId={DataSets.WF_STATUS}
                name='wfStatus'
                label={labels.wfStatus}
                readOnly
                valueField='key'
                displayField='value'
                values={formik.values.header}
              />
            </FormGrid>
            <Grid item xs={2}></Grid>
            <Grid item xs={4.5}>
              <FieldSet title='Transaction Details'>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={RemittanceOutwardsRepository.Country.qry}
                      name='countryId'
                      label={labels.Country}
                      required
                      readOnly={isClosed || isPosted || editMode}
                      displayField={['countryRef', 'countryName']}
                      columnsInDropDown={[
                        { key: 'countryRef', value: 'Reference' },
                        { key: 'countryName', value: 'Name' }
                      ]}
                      valueField='countryId'
                      values={formik.values.header}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('header.countryId', newValue ? newValue?.countryId : '')
                        formik.setFieldValue('header.countryRef', newValue ? newValue?.countryRef : '')
                        formik.setFieldValue('header.fcAmount', '')
                        formik.setFieldValue('header.lcAmount', '')
                        handleSelectedProduct(null, true)
                        formik.setFieldValue('header.products', [])
                        if (!newValue) {
                          formik.setFieldValue('header.dispersalType', '')
                          formik.setFieldValue('header.currencyId', '')
                        }
                      }}
                      error={formik.touched.header?.countryId && Boolean(formik.errors.header?.countryId)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={formik.values.header.countryId && RemittanceOutwardsRepository.DispersalType.qry}
                      parameters={formik.values.header.countryId && `_countryId=${formik.values.header.countryId}`}
                      label={labels.DispersalType}
                      required
                      readOnly={isClosed || isPosted || !formik.values.header.countryId || editMode}
                      name='dispersalType'
                      displayField='dispersalTypeName'
                      valueField='dispersalType'
                      values={formik.values.header}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('header.dispersalType', newValue ? newValue?.dispersalType : '')
                        formik.setFieldValue('header.dispersalTypeName', newValue ? newValue?.dispersalTypeName : '')
                        formik.setFieldValue('header.beneficiaryId', '')
                        formik.setFieldValue('header.beneficiaryName', '')
                        if (!newValue) formik.setFieldValue('header.currencyId', '')
                      }}
                      error={formik.touched.header?.dispersalType && Boolean(formik.errors.header?.dispersalType)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={
                        formik.values.header.countryId &&
                        formik.values.header.dispersalType &&
                        RemittanceOutwardsRepository.Currency.qry
                      }
                      parameters={`_dispersalType=${formik.values.header?.dispersalType}&_countryId=${formik.values.header?.countryId}`}
                      label={labels.Currency}
                      required
                      name='currencyId'
                      displayField={['currencyRef', 'currencyName']}
                      columnsInDropDown={[
                        { key: 'currencyRef', value: 'Reference' },
                        { key: 'currencyName', value: 'Name' }
                      ]}
                      valueField='currencyId'
                      values={formik.values.header}
                      readOnly={!formik.values.header.dispersalType || isClosed || isPosted || editMode}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('header.currencyId', newValue?.currencyId)
                        formik.setFieldValue('header.currencyRef', newValue?.currencyRef)
                      }}
                      error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomSwitch
                      readOnly={formik.values.header.lcAmount || formik.values.header.fcAmount || editMode}
                      label={labels.includeTransferFees}
                      name='includingFees'
                      checked={formik.values.header.includingFees}
                      onChange={e => formik.setFieldValue('header.includingFees', e.target.checked)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='fcAmount'
                      label={labels.fcAmount}
                      value={formik.values.header.fcAmount}
                      required
                      allowClear={!editMode}
                      readOnly={formik.values.header.lcAmount || editMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('header.fcAmount', e.target.value)}
                      onBlur={async () => {
                        if (!formik.values.header.lcAmount)
                          await fillProducts({
                            countryId: formik.values.header.countryId,
                            currencyId: formik.values.header.currencyId,
                            dispersalType: formik.values.header.dispersalType,
                            lcAmount: formik.values.header.lcAmount || 0,
                            fcAmount: formik.values.header.fcAmount || 0,
                            includingFees: formik.values.header.includingFees
                          })
                      }}
                      onClear={() => {
                        formik.setFieldValue('header.fcAmount', '')
                        if (!formik.values.header.lcAmount) {
                          handleSelectedProduct(null, true)
                          formik.setFieldValue('products', [])
                        }
                      }}
                      error={formik.touched.header?.fcAmount && Boolean(formik.errors.header?.fcAmount)}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='lcAmount'
                      label={labels.lcAmount}
                      value={formik.values.header.lcAmount}
                      required
                      allowClear={!editMode}
                      readOnly={formik.values.header.fcAmount || editMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('header.lcAmount', e.target.value)}
                      onBlur={async () => {
                        if (!formik.values.header.fcAmount)
                          await fillProducts({
                            countryId: formik.values.header.countryId,
                            currencyId: formik.values.header.currencyId,
                            dispersalType: formik.values.header.dispersalType,
                            lcAmount: formik.values.header.lcAmount || 0,
                            fcAmount: formik.values.header.fcAmount || 0,
                            includingFees: formik.values.header.includingFees
                          })
                      }}
                      onClear={() => {
                        formik.setFieldValue('header.lcAmount', '')
                        if (!formik.values.header.fcAmount) {
                          handleSelectedProduct(null, true)
                          formik.setFieldValue('products', [])
                        }
                      }}
                      error={formik.touched.header?.lcAmount && Boolean(formik.errors.header?.lcAmount)}
                      maxLength={10}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <CustomButton
                      label={'product'}
                      color='#000000'
                      disabled={
                        !(
                          plantId &&
                          formik.values.header.countryId &&
                          formik.values.header.currencyId &&
                          formik.values.header.dispersalType
                        )
                      }
                      onClick={() => openProductWindow()}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='corRef'
                      label={labels.corRef}
                      value={formik.values?.header.corRef}
                      readOnly
                      required={formik.values.header.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='corName'
                      label={labels.corName}
                      value={formik.values?.header?.corName}
                      readOnly
                      required={formik.values.header.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate'
                      label={labels.exRateMultiply}
                      value={formik.values.header.exRate}
                      required
                      readOnly
                      decimalScale={5}
                      maxAccess={maxAccess}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate2'
                      decimalScale={5}
                      label={labels.exRateDivide}
                      value={formik.values.header?.exRate ? 1 / formik.values.header.exRate : ''}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='commission'
                      label={labels.commission}
                      value={formik.values.header.commission}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      maxLength={10}
                    />
                  </Grid>
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
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='tdAmount'
                      label={labels.discount}
                      value={formik.values.header.tdAmount}
                      maxAccess={maxAccess}
                      onChange={e => {
                        formik.setFieldValue('header.tdAmount', e.target.value || 0)
                      }}
                      required
                      readOnly={editMode}
                      onClear={() => formik.setFieldValue('header.tdAmount', 0)}
                      error={formik.touched.header?.tdAmount && Boolean(formik.errors?.header?.tdAmount)}
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
                      maxLength={10}
                    />
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={7.5}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FieldSet title='Client Details'>
                    <Grid container spacing={3}>
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
                          formObject={formik.values.header}
                          required
                          readOnly={isClosed || isPosted || editMode}
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

                            const today = new Date()

                            const expiryDate = new Date(
                              parseInt(newValue?.expiryDate?.replace(/\/Date\((\d+)\)\//, '$1'))
                            )
                            if (expiryDate < today) {
                              stackError({
                                message: `Expired Client.`
                              })

                              return
                            }

                            formik.setFieldValue('header.clientId', newValue?.recordId || '')
                            formik.setFieldValue('header.clientName', newValue?.name || '')
                            formik.setFieldValue('header.clientRef', newValue?.reference || '')
                            formik.setFieldValue('header.category', newValue?.category || 1)
                            await chooseClient(newValue?.recordId, newValue?.category)
                            formik.setFieldValue('header.beneficiaryId', '')
                            formik.setFieldValue('header.beneficiaryName', '')
                          }}
                          errorCheck={'clientId'}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='firstName'
                          label={labels.firstName}
                          value={formik.values?.firstName}
                          readOnly
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='middleName'
                          label={labels.middleName}
                          value={formik.values?.middleName}
                          readOnly
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='lastName'
                          label={labels.lastName}
                          value={formik.values?.lastName}
                          readOnly
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <CustomTextField
                          name='familyName'
                          label={labels.familyName}
                          value={formik.values?.familyName}
                          readOnly
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={2} sx={{ flexDirection: 'row-reverse' }}>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='fl_firstName'
                              label={labels.flFirstName}
                              value={formik.values?.fl_firstName}
                              readOnly
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='fl_middleName'
                              label={labels.flMiddleName}
                              value={formik.values?.fl_middleName}
                              readOnly
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='fl_lastName'
                              label={labels.flLastName}
                              value={formik.values?.fl_lastName}
                              readOnly
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='fl_familyName'
                              label={labels.flFamilyName}
                              value={formik.values?.fl_familyName}
                              readOnly
                              dir='rtl'
                              error={formik.touched.fl_familyName && Boolean(formik.errors.fl_familyName)}
                              maxAccess={maxAccess}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <ResourceComboBox
                              endpointId={SystemRepository.Country.qry}
                              label={labels.Nationality}
                              name='nationalityId'
                              displayField={['reference', 'name']}
                              valueField='recordId'
                              values={formik.values.header}
                              readOnly
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <CustomTextField
                              name='idNo'
                              label={labels.IdNo}
                              value={formik.values.idNo}
                              readOnly
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <CustomDatePicker
                              name='expiryDate'
                              label={labels.expiryDate}
                              value={formik.values?.expiryDate}
                              readOnly
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <CustomTextField
                              name='cellPhone'
                              phone={true}
                              label={labels.cellPhone}
                              value={formik.values?.cellPhone}
                              readOnly
                              maxLength='15'
                              autoComplete='off'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <ResourceComboBox
                              endpointId={RemittanceSettingsRepository.Profession.qry}
                              label={labels.profession}
                              name='professionId'
                              displayField={['reference', 'name']}
                              valueField='recordId'
                              values={formik.values}
                              readOnly
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <CustomTextField
                              name='giftCode'
                              readOnly={editMode}
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
                              values={formik.values.header}
                              onChange={(event, newValue) => {
                                formik.setFieldValue('header.poeId', newValue ? newValue?.recordId : '')
                                formik.setFieldValue(
                                  'terraPayDetails.transaction.internationalTransferInformation.remittancePurpose',
                                  newValue?.name || ''
                                )
                              }}
                              required
                              readOnly={editMode}
                              error={formik.touched.header?.poeId && Boolean(formik.errors.header?.poeId)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <CustomTextArea
                          name='details'
                          label={labels.details}
                          value={formik.values.header.details}
                          rows={3}
                          maxLength='100'
                          readOnly={editMode}
                          editMode={editMode}
                          maxAccess={maxAccess}
                          onChange={e => formik.setFieldValue('details', e.target.value)}
                          onClear={() => formik.setFieldValue('details', '')}
                        />
                      </Grid>
                    </Grid>
                  </FieldSet>
                </Grid>
                <Grid item xs={5}>
                  <ResourceLookup
                    endpointId={RemittanceOutwardsRepository.Beneficiary.snapshot2}
                    parameters={{
                      _clientId: formik.values.header.clientId,
                      _dispersalType: formik.values.header.dispersalType,
                      _currencyId: formik.values.header.currencyId
                    }}
                    valueField='name'
                    displayField='name'
                    name='beneficiaryName'
                    label={labels.Beneficiary}
                    form={formik}
                    formObject={formik.values.header}
                    columnsInDropDown={[
                      { key: 'name', value: 'Name' },
                      { key: 'shortName', value: 'ShortName' }
                    ]}
                    required
                    readOnly={
                      !formik.values.header.clientId ||
                      !formik.values.header.dispersalType ||
                      isClosed ||
                      isPosted ||
                      editMode
                    }
                    maxAccess={maxAccess}
                    editMode={editMode}
                    secondDisplayField={false}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('header.beneficiaryId', newValue?.beneficiaryId)
                      formik.setFieldValue('header.beneficiaryName', newValue?.name)
                      formik.setFieldValue('header.beneficiarySeqNo', newValue?.seqNo)
                      formik.setFieldValue('terraPayDetails.quotation.creditorMSIDSN', newValue?.cellPhone)
                      formik.setFieldValue('terraPayDetails.quotation.creditorBankAccount', newValue?.IBAN)
                    }}
                    errorCheck={'header.beneficiaryId'}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomButton
                    onClick={() => openBankWindow()}
                    label={'Bank API'}
                    color='#000000'
                    disabled={!formik.values.header.beneficiaryId}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
