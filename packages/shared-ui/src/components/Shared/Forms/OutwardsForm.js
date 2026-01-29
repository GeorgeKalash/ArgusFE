import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import BenificiaryBankForm from '@argus/shared-ui/src/components/Shared/BenificiaryBankForm'
import BenificiaryCashForm from '@argus/shared-ui/src/components/Shared/BenificiaryCashForm'
import InstantCash from './InstantCash'
import TerraPay from './TerraPay'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { CTCLRepository } from '@argus/repositories/src/repositories/CTCLRepository'
import ProductsWindow from '@argus/shared-ui/src/components/Shared/Forms/ProductsWindow'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { useError } from '@argus/shared-providers/src/providers/error'
import toast from 'react-hot-toast'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { RTCLRepository } from '@argus/repositories/src/repositories/RTCLRepository'
import FormGrid from '@argus/shared-ui/src/components/form'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import BeneficiaryListWindow from '@argus/shared-ui/src/components/Shared/Forms/BeneficiaryListWindow'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import ReceiptVoucherForm from '@argus/shared-ui/src/components/Shared/Forms/ReceiptVoucherForm'
import CustomSwitch from '@argus/shared-ui/src/components/Inputs/CustomSwitch'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const OutwardsForm = ({ recordId, plantId, userId, dtId, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const userData = getStorageData('userData')

  const vatPctValue = parseInt(defaultsData?.list?.find(obj => obj.key === 'vatPct')?.value) || 0

  const [sysDefault, setDefault] = useState({ countryRef: '', currencyRef: '' })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.OutwardsOrder,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.OutwardsOrder, window })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.OutwardsOrder,
    access,
    objectName: 'header',
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
    fl_firstName: '',
    fl_middleName: '',
    fl_lastName: '',
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
        date: yup.date().required(),
        valueDate: yup.date().required(),
        countryId: yup.number().required(),
        dispersalType: yup.number().required(),
        currencyId: yup.number().required(),
        fcAmount: yup.number().required(),
        productId: yup.number().required(),
        commission: yup.number().required(),
        lcAmount: yup.number().required(),
        amount: yup.number().required(),
        exRate: yup.number().required(),
        clientId: yup.number().required(),
        poeId: yup.number().required(),
        beneficiaryId: yup.number().required(),
        tdAmount: yup.number().test(function (value) {
          const { commission } = this.parent

          return value <= commission
        })
      })
    }),
    onSubmit: async (values, actions) => {
      const header = values.header

      if (
        (header.interfaceId === 1 &&
          !values.ICRequest?.beneficiary?.bankDetails?.bankName &&
          !values.ICRequest?.remitter?.employerStatus) ||
        (header.interfaceId === 2 &&
          !values.terraPayDetails.transaction.internationalTransferInformation?.relationshipSender)
      ) {
        openBankWindow()
        throw { silent: true }
      }

      const data = {
        header: {
          ...header,
          date: formatDateToApi(header?.date),
          valueDate: formatDateToApi(header?.valueDate),
          defaultValueDate: formatDateToApi(header?.defaultValueDate)
        },
        bankType: header.interfaceId,
        ICRequest: header.interfaceId && values.ICRequest?.deliveryModeId ? values.ICRequest : null,
        TPRequest: header.interfaceId === 2 ? values.terraPayDetails : {}
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

  const header = formik.values.header

  const editMode = !!header.recordId
  const isClosed = header.wip === 2
  const isPosted = header.status === 3

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
        recordId: header.recordId
      })
    })
    toast.success(platformLabels.Closed)

    const result = await refetchForm(res?.recordId)
    result?.record?.headerView?.status === 4 && openRV()
    invalidate()
  }

  const onReopen = async () => {
    const obj = {
      ...formik.values,
      header: {
        ...header,
        date: formatDateToApi(header.date),
        valueDate: formatDateToApi(header.valueDate),
        defaultValueDate: formatDateToApi(header.defaultValueDate),
        expiryDate: formatDateToApi(header.expiryDate)
      }
    }

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.reopen,
      record: JSON.stringify(obj)
    })

    if (res.recordId) {
      toast.success(platformLabels.Reopened)
      invalidate()

      refetchForm(res.recordId)
    }
  }

  const vatAmount = (header?.commission * vatPctValue) / 100 || 0

  const amount = parseFloat(parseFloat(header.lcAmount) + (header.commission + vatAmount - header.tdAmount))

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

    const header = prevData?.header

    const updatedValues = {
      ...prevData,
      header: {
        ...header,
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
        lcAmount: clearAmounts ? '' : header.lcAmount || baseAmount,
        fcAmount: clearAmounts ? '' : header.fcAmount || originAmount
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
        date: formatDateFromApi(headerView.date),
        exRate: parseFloat(headerView.exRate).toFixed(5)
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

  function openRelevantWindow() {
    const {
      dispersalType,
      clientId,
      clientRef,
      clientName,
      corId,
      countryId,
      currencyId,
      beneficiaryId,
      beneficiarySeqNo
    } = formik.values?.header

    if (dispersalType)
      stack({
        Component: dispersalType === 1 ? BenificiaryCashForm : BenificiaryBankForm,
        props: {
          client: {
            clientId,
            clientRef,
            clientName
          },
          corId,
          dispersalType,
          countryId,
          currencyId,
          beneficiary: {
            beneficiaryId,
            beneficiarySeqNo
          },
          recordId:
            clientId && beneficiaryId && beneficiarySeqNo
              ? (clientId * 100).toString() + (beneficiaryId * 10).toString() + beneficiarySeqNo
              : null,
          forceDisable: !!formik.values.recordId && !!beneficiaryId,
          onSuccess: (response, values) => HandleAddedBenificiary(response, values)
        },
        title: dispersalType === 1 ? labels.cash : labels.bank
      })
  }

  function HandleAddedBenificiary(response, values) {
    const [, beneficiaryId, seqNo] = response.split(',')

    onChangeBeneficiary({ ...values, seqNo, beneficiaryId })
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
      if (!result) return

      const {
        clientIDView: { idExpiryDate, idNo },
        clientIndividual: {
          firstName,
          middleName,
          lastName,
          fl_firstName,
          fl_lastName,
          fl_middleName,
          professionId,
          sponsorName
        },
        clientRemittance: { trxCountPerYear, trxAmountPerYear },
        clientMaster: { cellPhone, nationalityId }
      } = result || {}

      formik.setValues({
        ...data,
        idNo,
        expiryDate: formatDateFromApi(idExpiryDate),
        firstName,
        middleName,
        lastName,
        fl_firstName,
        fl_middleName,
        fl_lastName,
        professionId,
        hiddenTrxCount: trxCountPerYear,
        hiddenTrxAmount: trxAmountPerYear,
        ICRequest: {
          ...data.ICRequest,
          remitter: {
            ...data.ICRequest?.remitter,
            employerName: sponsorName
          }
        },
        header: {
          ...data.header,
          cellPhone,
          nationalityId
        }
      })
    } else if (category == 2) {
      const result = await getRequest({
        extension: CTCLRepository.ClientCorporate.get,
        parameters: `_clientId=${clientId}`
      })

      if (!result) return

      formik.setFieldValue('expiryDate', formatDateFromApi(result?.clientMaster?.expiryDate))
      formik.setFieldValue('header.cellPhone', result?.clientMaster?.cellPhone)
      formik.setFieldValue('header.nationalityId', result?.clientMaster?.nationalityId)
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
      disabled: editMode || !(header?.countryId && header?.dispersalType && header?.clientId)
    },
    {
      key: 'Beneficiary',
      condition: true,
      onClick: openRelevantWindow,
      disabled: !(header?.dispersalType && header?.clientId)
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      valuesPath: header,
      datasetId: ResourceIds.GLOutwardsOrder,
      disabled: !editMode
    },
    {
      key: 'Receipt Voucher',
      condition: true,
      onClick: openRV,
      disabled: !(formik.values.header.status == 4)
    }
  ]

  function onSubmitBeneficiary(values) {
    formik.setFieldValue('header.branchCode', values?.branchCode)
    formik.setFieldValue('header.beneficiaryName', values?.beneficiaryName)
    formik.setFieldValue('header.beneficiarySeqNo', values?.beneficiarySeqNo)
    formik.setFieldValue('header.beneficiaryId', values?.beneficiaryId)
  }

  function openBeneficiaryWindow() {
    stack({
      Component: BeneficiaryListWindow,
      props: {
        form: header,
        onSubmit: onSubmitBeneficiary,
        labels,
        maxAccess
      },
      width: 1300,
      height: 500,
      title: labels.beneficiaryList
    })
  }

  function openProductWindow() {
    const {
      recordId,
      products,
      header: { countryRef, currencyRef, agentCode, fcAmount, lcAmount, productId }
    } = formik.values

    stack({
      Component: ProductsWindow,
      props: {
        maxAccess,
        labels,
        data: {
          recordId,
          products: products,
          countryRef,
          targetCurrency: currencyRef,
          defaultAgentCode: agentCode,
          fcAmount,
          lcAmount,
          productId,
          sysDefault
        },
        onProductSubmit
      },
      width: 1200,
      height: 500,
      title: labels.products
    })
  }

  function openBankWindow() {
    const {
      recordId,
      header: { interfaceId, countryId },
      ICRequest,
      products,
      terraPayDetails,
      hiddenTrxAmount,
      hiddenTrxCount
    } = formik.values

    if (interfaceId === 1) {
      const remitter = ICRequest?.remitter
      const beneficiary = ICRequest?.beneficiary
      const selectRow = products?.find(row => row?.checked)

      stack({
        Component: InstantCash,
        props: {
          onSubmit: onInstantCashSubmit,
          cashData: ICRequest,
          outwardsData: {
            recordId,
            countryId,
            amount
          },
          sysDefault,
          productData: {
            deliveryModeId: selectRow?.deliveryModeId || selectRow?.agentDeliveryMode,
            payingAgent: selectRow?.agentCode,
            payingCurrency: selectRow?.payingCurrency || selectRow?.agentPayingCurrency
          },
          clientData: {
            hiddenTrxAmount,
            hiddenTrxCount,
            bankDetails: beneficiary?.bankDetails,
            postCode: beneficiary?.address.postCode,
            relation: remitter?.relation,
            otherRelation: remitter?.otherRelation,
            employerName: remitter?.employerName,
            employerStatus: remitter?.employerStatus
          }
        },
        
        title: labels.instantCash
      })
    } else if (interfaceId === 2) {
      stack({
        Component: TerraPay,
        props: {
          onSubmit: onTerraPaySubmit,
          terraPay: terraPayDetails,
          data: header
        },
        width: 700,
        height: 500,
        title: labels.terraPay
      })
    }
  }

  async function onTerraPaySubmit(values) {
    const quotation = values?.quotation

    const data = {
      quotation: {
        ...quotation,
        debitorMSIDSN: header?.cellPhone,
        sendingCurrency: sysDefault?.currencyRef,
        receivingCurrency: quotation?.requestCurrency
      },
      transaction: {
        ...values.transaction,
        amount: quotation?.requestAmount,
        currency: quotation?.requestCurrency,
        type: 'inttransfer',
        descriptionText: '',
        requestingOrganisationTransactionReference: 't11',
        debitorMSIDSN: header?.cellPhone,
        creditorBankAccount: quotation.creditorBankAccount,
        creditorAccounttype: 'checking',
        internationalTransferInformation: {
          ...values.transaction.internationalTransferInformation,
          quoteId: '',
          receivingCountry: header?.countryRef,
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
        recordId: header?.receiptId,
        cashAccountId: cashAccountId,
        form: header?.receiptId ? null : header
      }
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
      const countryRef = await getDefaultCountry()
      const currencyRef = await getDefaultCurrency()

      setDefault({ countryRef, currencyRef })

      if (recordId) {
        const res = await refetchForm(recordId)

        const copy = { ...res.record }
        copy.lcAmount = 0
        await fillProducts(copy.headerView)
      }
    })()
  }, [])

  useEffect(() => {
    formik.setFieldValue('header.vatAmount', vatAmount)
    formik.setFieldValue('header.amount', amount)
  }, [amount])

  const onChangeBeneficiary = newValue => {
    formik.setFieldValue('header.beneficiaryName', newValue?.name || '')
    formik.setFieldValue('header.beneficiarySeqNo', newValue?.seqNo)
    formik.setFieldValue('header.branchCode', newValue?.branchCode)
    if (header.interfaceId === 2) {
      formik.setFieldValue('terraPayDetails.quotation.creditorMSIDSN', newValue?.cellPhone || '')
      formik.setFieldValue('terraPayDetails.quotation.creditorBankAccount', newValue?.IBAN || '')
    }
    formik.setFieldValue('header.beneficiaryId', newValue?.beneficiaryId || null)
  }

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
                name='header.reference'
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
                name='header.date'
                required
                label={labels.date}
                value={formik?.values?.header?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={isClosed || isPosted || editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.date', null)}
                error={formik.touched.header?.date && Boolean(formik.errors.header?.date)}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={2}>
              <ResourceComboBox
                datasetId={DataSets.DOCUMENT_STATUS}
                name='header.status'
                label={labels.docStatus}
                readOnly
                valueField='key'
                displayField='value'
                values={header}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={2}>
              <CustomDatePicker
                name='header.valueDate'
                label={labels.valueDate}
                value={formik?.values?.header.valueDate}
                onChange={formik.setFieldValue}
                readOnly={isClosed || isPosted || editMode}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('header.valueDate', null)}
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
                values={header}
              />
            </FormGrid>
            <Grid item xs={2}></Grid>
            <Grid item xs={4.5}>
              <FieldSet title='Transaction Details'>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={RemittanceOutwardsRepository.Country.qry}
                      name='header.countryId'
                      label={labels.Country}
                      required
                      readOnly={isClosed || isPosted || editMode}
                      displayField={['countryRef', 'countryName']}
                      columnsInDropDown={[
                        { key: 'countryRef', value: 'Reference' },
                        { key: 'countryName', value: 'Name' }
                      ]}
                      valueField='countryId'
                      values={header}
                      onChange={(event, newValue) => {
                        const updatedValues = {
                          ...formik.values,
                          header: {
                            ...header,
                            countryId: newValue?.countryId || null,
                            countryRef: newValue?.countryRef || '',
                            fcAmount: '',
                            lcAmount: '',
                            products: [],
                            dispersalType: newValue ? header.dispersalType : '',
                            currencyId: newValue ? header.currencyId : null
                          }
                        }
                        handleSelectedProduct(null, true, updatedValues)

                        formik.setFieldValue('header.countryId', newValue?.countryId || null)
                      }}
                      error={formik.touched.header?.countryId && Boolean(formik.errors.header?.countryId)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={header.countryId && RemittanceOutwardsRepository.DispersalType.qry}
                      parameters={header.countryId && `_countryId=${header.countryId}`}
                      label={labels.DispersalType}
                      required
                      readOnly={isClosed || isPosted || !header.countryId || editMode}
                      name='header.dispersalType'
                      displayField='dispersalTypeName'
                      valueField='dispersalType'
                      values={header}
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...formik.values,
                          header: {
                            ...header,
                            dispersalType: newValue?.dispersalType || '',
                            dispersalTypeName: newValue?.dispersalTypeName || '',
                            beneficiaryId: '',
                            beneficiaryName: '',
                            currencyId: newValue ? header.currencyId : '',
                            lcAmount: '',
                            fcAmount: '',
                            corRef: '',
                            corName: '',
                            exRate: 1,
                            exRate2: 1,
                            commission: 0
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
                          : header.countryId && header.dispersalType && RemittanceOutwardsRepository.Currency.qry
                      }
                      parameters={
                        !editMode
                          ? `_dispersalType=${header?.dispersalType}&_countryId=${header?.countryId}`
                          : undefined
                      }
                      label={labels.Currency}
                      required
                      name='header.currencyId'
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
                      values={header}
                      readOnly={!header.dispersalType || isClosed || isPosted || editMode}
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...formik.values,
                          header: {
                            ...header,
                            currencyId: newValue?.currencyId,
                            currencyRef: newValue?.currencyRef,
                            lcAmount: '',
                            fcAmount: '',
                            corRef: '',
                            corName: '',
                            exRate: 1,
                            exRate2: 1,
                            commission: 0
                          }
                        })
                      }}
                      error={formik.touched.header?.currencyId && Boolean(formik.errors.header?.currencyId)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomSwitch
                      readOnly={header.lcAmount || header.fcAmount || editMode}
                      label={labels.includeTransferFees}
                      name='header.includingFees'
                      checked={header.includingFees}
                      onChange={e => {
                        formik.setFieldValue('header.includingFees', e.target.checked)
                        formik.setFieldValue('header.lcAmount', '')
                        formik.setFieldValue('header.fcAmount', '')
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='header.fcAmount'
                      label={labels.fcAmount}
                      value={header.fcAmount}
                      required
                      allowClear={!editMode}
                      readOnly={header.lcAmount || editMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('header.fcAmount', e.target.value)}
                      onBlur={e => {
                        if (!header.lcAmount)
                          fillProducts({
                            countryId: header.countryId,
                            currencyId: header.currencyId,
                            dispersalType: header.dispersalType,
                            lcAmount: header.lcAmount || 0,
                            fcAmount: header.fcAmount || 0,
                            includingFees: header.includingFees,
                            plantId: header.plantId
                          })
                      }}
                      onClear={() => {
                        if (!header.lcAmount) {
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
                      name='header.lcAmount'
                      label={labels.lcAmount}
                      value={header.lcAmount}
                      required
                      allowClear={!editMode}
                      readOnly={header.fcAmount || editMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('header.lcAmount', e.target.value)}
                      onBlur={async e => {
                        if (!header.fcAmount)
                          await fillProducts({
                            countryId: header.countryId,
                            currencyId: header.currencyId,
                            dispersalType: header.dispersalType,
                            lcAmount: header.lcAmount || 0,
                            fcAmount: header.fcAmount || 0,
                            includingFees: header.includingFees,
                            plantId: header.plantId
                          })
                      }}
                      onClear={() => {
                        if (!header.fcAmount) {
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
                          header.countryId &&
                          header.currencyId &&
                          header.dispersalType &&
                          (header.fcAmount || header.lcAmount)
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
                      name='header.corRef'
                      label={labels.corRef}
                      value={formik.values?.header.corRef}
                      readOnly
                      required={header.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='header.corName'
                      label={labels.corName}
                      value={formik.values?.header?.corName}
                      readOnly
                      required={header.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='header.exRate'
                      label={labels.exRateMultiply}
                      value={header.exRate}
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
                      name='header.exRate2'
                      decimalScale={5}
                      label={labels.exRateDivide}
                      value={
                        formik?.values?.header?.exRate && formik?.values?.header.exRate != 0
                          ? 1 / formik?.values?.header.exRate
                          : '0.00000'
                      }
                      readOnly
                      maxAccess={maxAccess}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='header.commission'
                      label={labels.commission}
                      value={header.commission}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      maxLength={10}
                      error={formik.touched.header?.commission && Boolean(formik.errors?.header?.commission)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='header.vatAmount'
                      label={labels.vatRate}
                      value={vatAmount}
                      readOnly
                      maxAccess={maxAccess}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='header.tdAmount'
                      label={labels.discount}
                      value={header.tdAmount}
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
                      name='header.amount'
                      label={labels.NetToPay}
                      value={header.amount}
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
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <ResourceLookup
                          endpointId={CTCLRepository.ClientCorporate.snapshot}
                          parameters={{
                            _category: 0
                          }}
                          valueField='reference'
                          displayField='name'
                          name='header.clientId'
                          label={labels.Client}
                          form={formik}
                          formObject={header}
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

                            const updatedValues = {
                              ...formik.values,
                              header: {
                                ...header,
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
                      <Grid item xs={4}>
                        <CustomTextField
                          name='firstName'
                          label={labels.firstName}
                          value={formik.values?.firstName}
                          readOnly
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='middleName'
                          label={labels.middleName}
                          value={formik.values?.middleName}
                          readOnly
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='lastName'
                          label={labels.lastName}
                          value={formik.values?.lastName}
                          readOnly
                          maxAccess={maxAccess}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container spacing={2} sx={{ flexDirection: 'row-reverse' }}>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_firstName'
                              label={labels.flFirstName}
                              value={formik.values?.fl_firstName}
                              readOnly
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_middleName'
                              label={labels.flMiddleName}
                              value={formik.values?.fl_middleName}
                              readOnly
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <CustomTextField
                              name='fl_lastName'
                              label={labels.flLastName}
                              value={formik.values?.fl_lastName}
                              readOnly
                              dir='rtl'
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
                              name='header.nationalityId'
                              displayField={['reference', 'name']}
                              valueField='recordId'
                              values={header}
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
                              name='header.cellPhone'
                              phone={true}
                              label={labels.cellPhone}
                              value={formik.values?.header.cellPhone}
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
                              name='header.poeId'
                              label={labels.purposeOfExchange}
                              valueField='recordId'
                              displayField={['reference', 'name']}
                              columnsInDropDown={[
                                { key: 'reference', value: 'Reference' },
                                { key: 'name', value: 'Name' }
                              ]}
                              values={header}
                              onChange={(event, newValue) => {
                                formik.setValues({
                                  ...formik.values,
                                  header: {
                                    ...header,
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
                      _clientId: header.clientId,
                      _dispersalType: header.dispersalType,
                      _currencyId: header.currencyId
                    }}
                    valueField='name'
                    displayField='name'
                    name='header.beneficiaryName'
                    label={labels.Beneficiary}
                    form={formik}
                    formObject={header}
                    columnsInDropDown={[
                      { key: 'name', value: 'Name' },
                      { key: 'shortName', value: 'ShortName' }
                    ]}
                    required
                    readOnly={!header.clientId || !header.dispersalType || isClosed || isPosted || editMode}
                    maxAccess={maxAccess}
                    editMode={editMode}
                    secondDisplayField={false}
                    onChange={async (event, newValue) => {
                      onChangeBeneficiary(newValue)
                    }}
                    errorCheck={'header.beneficiaryId'}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomButton
                    onClick={() => openBankWindow()}
                    label={labels.bankApi}
                    color='#000000'
                    disabled={!header?.beneficiaryId || !header?.interfaceId || !header.productId}
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

OutwardsForm.width = 1100
OutwardsForm.height = 600

export default OutwardsForm
