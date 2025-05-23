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

  const vatPctValue = parseInt(defaultsData?.list?.find(obj => obj.key === 'vatPct')?.value) || 0

  const [sysDefault, setDefault] = useState({ countryRef: '', currencyRef: '' })

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
      fcAmount: null,
      exRate: 1,
      commission: '',
      valueDate: new Date(),
      defaultValueDate: new Date(),
      vatAmount: null,
      tdAmount: 0,
      defaultCommission: 12,
      amount: 0,
      taxPercent: vatPctValue,
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
      recordId,
      branchCode: ''
    },
    products: [{}],
    ICRequest: [{}],
    tokenNo: '',
    vatRate: vatPctValue,
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
        creditorOrganisationid: '',
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
        valueDate: yup.date().required(),
        countryId: yup.number().required(),
        dispersalType: yup.number().required(),
        currencyId: yup.number().required(),
        fcAmount: yup.number().required(),
        productId: yup.number().required(),
        commission: yup.number().required(),
        lcAmount: yup.number().required(),
        exRate: yup.number().required(),
        clientId: yup.number().required(),
        poeId: yup.number().required(),
        beneficiaryId: yup.number().required(),
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
        bankType: values.header.interfaceId,
        ICRequest: values.header.interfaceId && values.ICRequest?.deliveryModeId ? values.ICRequest : null,
        TPRequest: values.header.interfaceId === 2 ? values.terraPayDetails : {}
      }

      const result = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsOrder.set2,
        record: JSON.stringify(data)
      })

      toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
      await refetchForm(result.recordId)

      invalidate()
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

  async function getOutwardsRequest(recordId) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsRequest.get,
      parameters: `_recordId=${recordId}&_functionId=${SystemFunction.OutwardsOrder}`
    })
  }

  const onClose = async () => {
    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.close,
      record: JSON.stringify({
        recordId: formik.values.header.recordId
      })
    })
    toast.success(platformLabels.Closed)

    const result = await refetchForm(res?.recordId)
    result?.record?.headerView?.status === 4 && openRV()
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
    }
  }

  const vatAmount = (formik.values.header?.commission * formik.values.header.vatRate) / 100 || 0

  const amount = parseFloat(
    parseFloat(formik.values.header.lcAmount) +
      (formik.values.header.commission + vatAmount - formik.values.header.tdAmount)
  )

  const onProductSubmit = productData => {
    formik.setFieldValue('products', productData?.list)
    const selectedRowData = productData?.list?.find(row => row.checked)
    handleSelectedProduct(selectedRowData, null, { ...formik.values, products: productData?.list })
  }

  function handleSelectedProduct(selectedRowData, clearAmounts, data) {
    const {
      interfaceId,
      productId,
      fees,
      dispersalId,
      exRate,
      rateCalcMethod,
      agentCode,
      corId,
      corRef,
      corName,
      rateTypeId,
      baseAmount,
      originAmount,
      valueDays
    } = selectedRowData || {}

    const prevData = data || formik.values

    const updatedValues = {
      ...prevData,
      header: {
        ...prevData.header,
        interfaceId,
        productId,
        commission: fees,
        defaultCommission: fees,
        dispersalId,
        exRate: parseFloat(exRate).toFixed(5),
        rateCalcMethod,
        corId,
        corRef,
        corName,
        rateTypeId,
        lcAmount: clearAmounts ? null : prevData?.header.lcAmount || baseAmount,
        fcAmount: clearAmounts ? null : prevData?.header.fcAmount || originAmount
      },
      ...(agentCode && { agentCode })
    }

    formik.setValues(updatedValues)

    calculateValueDate(valueDays)

    return updatedValues
  }

  const fillOutwardsData = async (data, dataRequest) => {
    const { headerView } = data

    const updatedValues = formik.values && {
      ...formik.values,
      products: formik.values.products,
      recordId: headerView.recordId,
      header: {
        ...headerView,
        valueDate: formatDateFromApi(headerView.valueDate),
        defaultValueDate: formatDateFromApi(headerView.defaultValueDate),
        date: formatDateFromApi(headerView.date)
      },
      ICRequest:
        headerView.interfaceId == 1 && dataRequest?.requestLog
          ? JSON.parse(dataRequest?.requestLog)
          : formik.values.ICRequest,
      terraPayDetails:
        headerView.interfaceId == 2 && dataRequest?.requestLog
          ? JSON.parse(dataRequest?.requestLog)
          : formik.values.terraPayDetails
    }

    formik.setValues(updatedValues)

    return updatedValues
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
          corId: formik.values.header.corId || 0,
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
          corId: formik.values.header.corId || 0,
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

  const chooseClient = async (clientId, category, data) => {
    if (category == 1) {
      const result = clientId ? await getClientInfo(clientId) : null

      if (clientId && !result?.clientRemittance) {
        stackError({ message: labels.clientHasNoKyc })

        return
      }

      formik.setValues({
        ...data,
        idNo: result?.clientIDView?.idNo,
        expiryDate: formatDateFromApi(result?.clientIDView?.idExpiryDate),
        firstName: result?.clientIndividual?.firstName,
        middleName: result?.clientIndividual?.middleName,
        lastName: result?.clientIndividual?.lastName,
        familyName: result?.clientIndividual?.familyName,
        fl_firstName: result?.clientIndividual?.fl_firstName,
        fl_middleName: result?.clientIndividual?.fl_middleName,
        fl_lastName: result?.clientIndividual?.fl_lastName,
        fl_familyName: result?.clientIndividual?.fl_familyName,
        professionId: result?.clientIndividual?.professionId,
        hiddenTrxCount: result?.clientRemittance?.trxCountPerYear,
        hiddenTrxAmount: result?.clientRemittance?.trxAmountPerYear,
        ICRequest: {
          ...data.ICRequest,
          remitter: {
            ...data.ICRequest?.remitter,
            employerName: result?.clientIndividual?.sponsorName
          }
        },
        header: {
          ...data.header,
          cellPhone: result?.clientMaster?.cellPhone,
          nationalityId: result?.clientMaster?.nationalityId
        }
      })
    } else if (category == 2) {
      const result = await getRequest({
        extension: CTCLRepository.ClientCorporate.get,
        parameters: `_clientId=${clientId}`
      })

      if (!result) return

      formik.setValues(prev => ({
        ...data,
        expiryDate: formatDateFromApi(result?.clientMaster?.expiryDate),
        header: {
          ...data.header,
          cellPhone: result?.clientMaster?.cellPhone,
          nationalityId: result?.clientMaster?.nationalityId
        }
      }))
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
        data: {
          products: formik.values.products,
          countryRef: formik.values.header.countryRef,
          targetCurrency: formik.values.header.currencyRef,
          defaultAgentCode: formik.values.agentCode,
          fcAmount: formik.values.header.fcAmount,
          lcAmount: formik.values.header.lcAmount,
          productId: formik.values.header.productId,
          sysDefault
        },
        onProductSubmit,
        editMode
      },
      width: 900,
      height: 500,
      title: labels.products
    })
  }

  function openBankWindow() {
    if (formik.values.header.interfaceId === 1) {
      const remitter = formik.values.ICRequest.remitter
      const beneficiary = formik.values.ICRequest.beneficiary
      const selectRow = formik.values?.products?.find(row => row?.checked)

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
          productData: {
            deliveryModeId: selectRow?.deliveryModeId || selectRow?.agentDeliveryMode,
            payingAgent: selectRow?.agentCode,
            payingCurrency: selectRow?.payingCurrency || selectRow?.agentPayingCurrency
          },
          clientData: {
            hiddenTrxAmount: formik.values.hiddenTrxAmount,
            hiddenTrxCount: formik.values.hiddenTrxCount,
            bankDetails: beneficiary?.bankDetails,
            postCode: beneficiary?.address.postCode,
            relation: remitter?.relation,
            otherRelation: remitter?.otherRelation,
            employerName: remitter?.employerName,
            employerStatus: remitter?.employerStatus
          },
          editMode
        },
        width: 740,
        height: 320,
        title: labels.instantCash
      })
    } else if (formik.values.header.interfaceId === 2) {
      stack({
        Component: TerraPay,
        props: {
          onSubmit: onTerraPaySubmit,
          terraPay: formik.values.terraPayDetails,
          data: formik.values.header
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
        type: 'inttransfer',
        descriptionText: '',
        requestingOrganisationTransactionReference: 't11',
        debitorMSIDSN: formik.values.header?.cellPhone,
        creditorBankAccount: values?.quotation.creditorBankAccount,
        creditorAccounttype: 'checking',
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

  async function refetchForm(recordId) {
    const [res, resRequest] = await Promise.all([getOutwards(recordId), getOutwardsRequest(recordId)])

    const data = await fillOutwardsData(res.record, resRequest.record)
    await chooseClient(res.record.headerView.clientId, res.record.headerView.category, data)

    return res
  }

  async function fillProducts(data) {
    try {
      if (!data?.fcAmount && !data?.lcAmount) {
        return
      }
      if (plantId && data?.countryId && data?.currencyId && data?.dispersalType) {
        formik.setFieldValue('products', [])

        var parameters = `_plantId=${editMode ? data.plantId : plantId}&_countryId=${data.countryId}&_dispersalType=${
          data.dispersalType
        }&_currencyId=${data?.currencyId}&_fcAmount=${data?.fcAmount}&_lcAmount=${
          data?.recordId ? 0 : data?.lcAmount
        }&_includingFees=${data?.includingFees ? 1 : 0}`

        const res = await getRequest({
          extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
          parameters: parameters
        })

        if (res?.list?.length > 0) {
          await displayProduct(res.list, data.header?.productId, { ...formik.values, products: res.list })
          formik.setFieldValue('products', res.list)
        } else {
          !editMode &&
            handleSelectedProduct(null, null, {
              ...formik.values,
              products: []
            })
        }
      }
    } catch (error) {
      !editMode && handleSelectedProduct(null, null, { ...formik.values, products: [] })
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
      !editMode && handleSelectedProduct(data[0])
      formik.setFieldValue('products[0].checked', true)
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
      actions={actions}
      previewReport={editMode}
      functionId={SystemFunction.OutwardsOrder}
      disabledSubmit={editMode}
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
                        const updatedValues = formik.values && {
                          ...formik.values,
                          header: {
                            ...formik.values.header,
                            countryId: newValue?.countryId || null,
                            countryRef: newValue?.countryRef || '',
                            fcAmount: '',
                            lcAmount: '',
                            products: [],
                            dispersalType: newValue ? formik.values.header.dispersalType : '',
                            currencyId: newValue ? formik.values.header.currencyId : ''
                          }
                        }

                        handleSelectedProduct(null, true, updatedValues)
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
                        formik.setValues({
                          ...formik.values,
                          header: {
                            ...formik.values.header,
                            dispersalType: newValue?.dispersalType || '',
                            dispersalTypeName: newValue?.dispersalTypeName || '',
                            beneficiaryId: '',
                            beneficiaryName: '',
                            currencyId: newValue ? formik.values.header.currencyId : '',
                            lcAmount: '',
                            fcAmount: ''
                          }
                        })
                      }}
                      error={formik.touched.header?.dispersalType && Boolean(formik.errors.header?.dispersalType)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={
                        editMode
                          ? SystemRepository.Currency.qry
                          : formik.values.header.countryId &&
                            formik.values.header.dispersalType &&
                            RemittanceOutwardsRepository.Currency.qry
                      }
                      parameters={
                        !editMode
                          ? `_dispersalType=${formik.values.header?.dispersalType}&_countryId=${formik.values.header?.countryId}`
                          : undefined
                      }
                      label={labels.Currency}
                      required
                      name='currencyId'
                      displayField={editMode ? ['reference', 'name'] : ['currencyRef', 'currencyName']}
                      columnsInDropDown={
                        editMode
                          ? [
                              { key: 'reference', value: 'Reference' },
                              { key: 'name', value: 'Name' }
                            ]
                          : [
                              { key: 'currencyRef', value: 'Reference' },
                              { key: 'currencyName', value: 'Name' }
                            ]
                      }
                      valueField={editMode ? 'recordId' : 'currencyId'}
                      values={formik.values.header}
                      readOnly={!formik.values.header.dispersalType || isClosed || isPosted || editMode}
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...formik.values,
                          header: {
                            ...formik.values.header,
                            currencyId: newValue?.currencyId,
                            currencyRef: newValue?.currencyRef,
                            lcAmount: '',
                            fcAmount: ''
                          }
                        })
                      }}
                      error={formik.touched.header?.currencyId && Boolean(formik.errors.header?.currencyId)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomSwitch
                      readOnly={formik.values.header.lcAmount || formik.values.header.fcAmount || editMode}
                      label={labels.includeTransferFees}
                      name='includingFees'
                      checked={formik.values.header.includingFees}
                      onChange={e => {
                        formik.setFieldValue('header.includingFees', e.target.checked)
                        formik.setFieldValue('header.lcAmount', '')
                        formik.setFieldValue('header.fcAmount', '')
                      }}
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
                      onBlur={e => {
                        if (!formik.values.header.lcAmount)
                          fillProducts({
                            countryId: formik.values.header.countryId,
                            currencyId: formik.values.header.currencyId,
                            dispersalType: formik.values.header.dispersalType,
                            lcAmount: formik.values.header.lcAmount || 0,
                            fcAmount: formik.values.header.fcAmount || 0,
                            includingFees: formik.values.header.includingFees,
                            plantId: formik.values.header.plantId
                          })
                      }}
                      onClear={() => {
                        if (!formik.values.header.lcAmount) {
                          handleSelectedProduct(null, true, {
                            ...formik.values,
                            products: []
                          })
                        }
                        formik.setFieldValue('header.fcAmount', '')
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
                      onBlur={async e => {
                        if (!formik.values.header.fcAmount)
                          await fillProducts({
                            countryId: formik.values.header.countryId,
                            currencyId: formik.values.header.currencyId,
                            dispersalType: formik.values.header.dispersalType,
                            lcAmount: formik.values.header.lcAmount || 0,
                            fcAmount: formik.values.header.fcAmount || 0,
                            includingFees: formik.values.header.includingFees,
                            plantId: formik.values.header.plantId
                          })
                      }}
                      onClear={() => {
                        if (!formik.values.header.fcAmount) {
                          handleSelectedProduct(null, true, {
                            ...formik.values,
                            products: []
                          })
                        }
                        formik.setFieldValue('header.lcAmount', '')
                      }}
                      error={formik.touched.header?.lcAmount && Boolean(formik.errors.header?.lcAmount)}
                      maxLength={10}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <CustomButton
                      label={labels.products}
                      color='#000000'
                      disabled={
                        !(
                          plantId &&
                          formik.values.header.countryId &&
                          formik.values.header.currencyId &&
                          formik.values.header.dispersalType &&
                          (formik.values.header.fcAmount || formik.values.header.lcAmount)
                        )
                      }
                      onClick={() =>
                        setTimeout(() => {
                          openProductWindow()
                        }, 10)
                      }
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
                      error={formik.touched.header?.exRate && Boolean(formik.errors.header?.exRate)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate2'
                      decimalScale={5}
                      label={labels.exRateDivide}
                      value={formik.values.header?.exRate ? 1 / formik.values.header.exRate : ''}
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
                      error={formik.touched.header?.amount && Boolean(formik.errors?.header?.amount)}
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
                                message: labels.ClientMustBeActive
                              })

                              return
                            }

                            const today = new Date()

                            const expiryDate = new Date(
                              parseInt(newValue?.expiryDate?.replace(/\/Date\((\d+)\)\//, '$1'))
                            )
                            if (expiryDate < today) {
                              stackError({
                                message: labels.expiredClient
                              })

                              return
                            }

                            const updatedValues = formik.values && {
                              ...formik.values,
                              header: {
                                ...formik.values.header,
                                clientId: newValue?.recordId || null,
                                clientName: newValue?.name || '',
                                clientRef: newValue?.reference || '',
                                category: newValue?.category || 1,
                                beneficiaryId: null,
                                beneficiaryName: '',
                                beneficiarySeqNo: null,
                                branchCode: ''
                              }
                            }

                            formik.setValues(updatedValues)

                            await chooseClient(newValue?.recordId, newValue?.category || 1, updatedValues)
                          }}
                          errorCheck={'header.clientId'}
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
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={3}>
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
                          <Grid item xs={3}>
                            <CustomTextField
                              name='idNo'
                              label={labels.IdNo}
                              value={formik.values.idNo}
                              readOnly
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomDatePicker
                              name='expiryDate'
                              label={labels.expiryDate}
                              value={formik.values?.expiryDate}
                              readOnly
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
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
                                formik.setValues({
                                  ...formik.values,
                                  header: {
                                    ...formik.values.header,
                                    poeId: newValue?.recordId || null
                                  },
                                  terraPayDetails: {
                                    ...formik.values.terraPayDetails,
                                    transaction: {
                                      ...formik.values.terraPayDetails?.transaction,
                                      internationalTransferInformation: {
                                        ...formik.values.terraPayDetails?.transaction?.internationalTransferInformation,
                                        remittancePurpose: newValue?.name || ''
                                      }
                                    }
                                  }
                                })
                              }}
                              required
                              readOnly={editMode}
                              error={formik.touched.header?.poeId && Boolean(formik.errors.header?.poeId)}
                            />
                          </Grid>
                        </Grid>
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
                      formik.setFieldValue('header.branchCode', newValue?.branchCode)
                      if (formik.values.header.interfaceId === 2) {
                        formik.setFieldValue('terraPayDetails.quotation.creditorMSIDSN', newValue?.cellPhone || '')
                        formik.setFieldValue('terraPayDetails.quotation.creditorBankAccount', newValue?.IBAN || '')
                      }
                    }}
                    errorCheck={'header.beneficiaryId'}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomButton
                    onClick={() => openBankWindow()}
                    label={labels.bankApi}
                    color='#000000'
                    disabled={
                      !formik.values.header.beneficiaryId ||
                      !formik.values.header.interfaceId ||
                      !formik.values.header.productId
                    }
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
