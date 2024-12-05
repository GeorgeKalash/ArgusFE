import { useEffect } from 'react'
import { Grid, Button } from '@mui/material'
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
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import BeneficiaryListWindow from '../Windows/BeneficiaryListWindow'
import { getStorageData } from 'src/storage/storage'
import ReceiptVoucherForm from 'src/pages/rt-receipt-vouchers/forms/ReceiptVoucherForm'

export default function OutwardsForm({ labels, access, recordId, plantId, userId, dtId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  const DEFAULT_DELIVERYMODE = 7
  const userData = getStorageData('userData')

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
    recordId: recordId || null,
    dtId: dtId || null,
    plantId: plantId,
    userId: userId,
    productId: '',
    dispersalId: '',
    countryId: '',
    countryref: '',
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
    category: '',
    fcAmount: null,
    corId: '',
    corRef: '',
    corName: '',
    rateTypeId: '',
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
    tokenNo: '',
    valueDate: new Date(),
    defaultValueDate: new Date(),
    vatAmount: null,
    vatRate: null,
    taxPercent: null,
    tdAmount: 0,
    giftCode: '',
    details: '',
    hiddenTrxAmount: '',
    hiddenTrxCount: '',
    hiddenSponserName: '',
    bankType: '',
    receiptId: null,
    instantCashDetails: {},
    products: [{}],
    ICRates: [{}]
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validateOnChange: true,
    validationSchema: yup.object({
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
    }),
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.instantCashDetails
      delete copy.products
      copy.date = formatDateToApi(copy.date)
      copy.valueDate = formatDateToApi(copy.valueDate)
      copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
      copy.vatAmount = vatAmount
      copy.amount = amount

      const amountGridData = {
        header: copy,
        bankType: formik.values.bankType,
        ICRequest: formik.values.instantCashDetails?.deliveryModeId ? formik.values.instantCashDetails : null
      }

      const amountRes = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsOrder.set2,
        record: JSON.stringify(amountGridData)
      })

      if (amountRes.recordId) {
        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        formik.setFieldValue('recordId', amountRes.recordId)
        const res2 = await getOutwards(amountRes.recordId)
        formik.setFieldValue('reference', res2.record.reference)
        invalidate()
      }
    }
  })
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 4

  console.log(formik)

  const getCashAccountId = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData?.userId}&_key=cashAccountId`
    })

    return res?.record?.value
  }

  async function getOutwards(recordId) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.get,
      parameters: `_recordId=${recordId}`
    })
  }

  const onClose = async recId => {
    await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.close,
      record: JSON.stringify({
        recordId: formik.values.recordId ?? recId
      })
    }).then(async res => {
      if (res.recordId) {
        if (recordId) toast.success(platformLabels.Closed)
        invalidate()
        refetchForm(res.recordId)
        await getDefaultVAT()
        const result = await getOutwards(res.recordId)
        result.record.status === 4 && openRV()
      }
    })
  }

  const onReopen = async () => {
    const copy = { ...formik.values }
    delete copy.instantCashDetails
    copy.date = formatDateToApi(copy.date)
    copy.valueDate = formatDateToApi(copy.valueDate)
    copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
    copy.expiryDate = formatDateToApi(copy.expiryDate)

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

  const onPost = async () => {
    const copy = { ...formik.values }
    copy.date = formatDateToApi(copy.date)
    copy.valueDate = formatDateToApi(copy.valueDate)
    copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
    copy.expiryDate = formatDateToApi(copy.expiryDate)

    await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.post,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const vatAmount = (formik.values.commission * formik.values.vatRate) / 100

  const amount = parseFloat(
    parseFloat(formik.values.lcAmount) + (formik.values.commission + vatAmount - formik.values.tdAmount)
  )

  const onProductSubmit = productData => {
    formik.setFieldValue('products', productData?.list)
    const selectedRowData = productData?.list?.find(row => row.checked)
    handleSelectedProduct(selectedRowData)

    console.log(selectedRowData, 'selectedRowData')
  }

  function handleSelectedProduct(selectedRowData, clearAmounts) {
    formik.setFieldValue('bankType', selectedRowData?.interfaceId)
    formik.setFieldValue('productId', selectedRowData?.productId)
    formik.setFieldValue('commission', selectedRowData?.fees)
    formik.setFieldValue('defaultCommission', selectedRowData?.fees)
    formik.setFieldValue('dispersalId', selectedRowData?.dispersalId)
    formik.setFieldValue('exRate', parseFloat(selectedRowData?.exRate).toFixed(5))
    formik.setFieldValue('rateCalcMethod', selectedRowData?.rateCalcMethod)
    formik.setFieldValue('corId', selectedRowData?.corId)
    formik.setFieldValue('corRef', selectedRowData?.corRef)
    formik.setFieldValue('corName', selectedRowData?.corName)
    formik.setFieldValue('rateTypeId', selectedRowData?.rateTypeId)
    calculateValueDate(selectedRowData?.valueDays)
    if (clearAmounts) {
      formik.setFieldValue('lcAmount', '')
      formik.setFieldValue('fcAmount', '')
    } else {
      formik.setFieldValue('lcAmount', formik.values.lcAmount || selectedRowData?.baseAmount)
      formik.setFieldValue('fcAmount', formik.values.fcAmount || selectedRowData?.originAmount)
    }
  }

  const fillOutwardsData = async data => {
    console.log(data, 'data')
    formik.setValues(prevValues => ({
      ...prevValues,
      ...data,
      date: formatDateFromApi(data.date),
      exRate: parseFloat(data.exRate).toFixed(5),
      defaultValueDate: formatDateFromApi(data.defaultValueDate),
      valueDate: formatDateFromApi(data.valueDate),
      bankType: data.interfaceId,
      products: prevValues.products,
      instantCashDetails: prevValues.instantCashDetails
    }))
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

  const chooseClient = async (clientId, category) => {
    if (clientId) {
      if (category == 1) {
        //client individual
        const res = await getRequest({
          extension: RTCLRepository.CtClientIndividual.get2,
          parameters: `_clientId=${clientId}`
        })
        if (!res.record?.clientRemittance) {
          stackError({
            message: `Chosen Client Has No KYC.`
          })

          return
        }
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
      } else if (category == 2) {
        const res = await getRequest({
          extension: CTCLRepository.ClientCorporate.get,
          parameters: `_clientId=${clientId}`
        })
        if (!res) {
          return
        }
        formik.setFieldValue('nationalityId', res?.record?.clientMaster?.nationalityId)
        formik.setFieldValue('cellPhone', res?.record?.clientMaster?.cellPhone)
        formik.setFieldValue('expiryDate', formatDateFromApi(res?.record?.clientMaster?.expiryDate))
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

    // {
    //   key: 'Post',
    //   condition: true,
    //   onClick: onPost,
    //   disabled: !isPosted || !formik.values.corId
    // },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
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
        onProductSubmit,
        editMode
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
            amount: formik.values.amount || amount
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
        props: {},
        width: 700,
        height: 500,
        title: labels.terraPay
      })
    }
  }

  async function openRV() {
    window.close()
    const cashAccountId = await getCashAccountId()
    stack({
      Component: ReceiptVoucherForm,
      props: {
        labels: RVLabels,
        maxAccess: RVAccess,
        recordId: formik.values.receiptId || '',
        cashAccountId: cashAccountId,
        form: formik.values.receiptId ? null : formik
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
    formik.setFieldValue('vatRate', parseInt(res.record.value))
    formik.setFieldValue('taxPercent', parseFloat(res.record.value))
  }

  async function getDefaultCountry() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=countryId`
    })

    const countryRef = await getRequest({
      extension: SystemRepository.Country.get,
      parameters: `_recordId=${res?.record?.value}`
    })

    return countryRef.record.reference
  }

  async function getDefaultCurrency() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=baseCurrencyId`
    })

    const currencyRef = await getRequest({
      extension: SystemRepository.Currency.get,
      parameters: `_recordId=${res?.record?.value}`
    })

    return currencyRef.record.reference
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
    console.log()
    await chooseClient(res.record.clientId, res.record.category)

    return res
  }

  async function fillProducts(data) {
    try {
      if (!data.fcAmount && !data.lcAmount) {
        return
      }
      
      console.log(data.fcAmount)
      if (plantId && data.countryId && data.currencyId && data.dispersalType) {
        formik.setFieldValue('products', [])
        var parameters = `_plantId=${plantId}&_countryId=${data.countryId}&_dispersalType=${data.dispersalType}&_currencyId=${data.currencyId}&_fcAmount=${data.fcAmount}&_lcAmount=${data.lcAmount}`

        const res = await getRequest({
          extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
          parameters: parameters
        })

        console.log(res)

        if (res.list.length > 0) {
          formik.setFieldValue('products', res.list)
          const InstantCashProduct = res.list.find(item => item.interfaceId === 1)
          InstantCashProduct ? await mergeICRates(res.list, data) : await displayProduct(res.list, data.productId)
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
  async function mergeICRates(data, outwardsList) {
    const syCountryId = await getDefaultCountry()
    const srcCurrency = await getDefaultCurrency()
    const targetCurrency = formik.values.currencyRef || outwardsList.currencyRef
    const srcAmount = outwardsList?.lcAmount || formik.values.lcAmount || 0
    const trgtAmount = outwardsList?.fcAmount || formik.values.fcAmount || 0
    const countryRef = formik.values.countryRef || outwardsList.countryRef

    try {
      const getRates = await getRequest({
        extension: RemittanceBankInterface.InstantCashRates.qry,
        parameters: `_deliveryMode=${DEFAULT_DELIVERYMODE}&_sourceCurrency=${srcCurrency}&_targetCurrency=${targetCurrency}&_sourceAmount=${srcAmount}&_targetAmount=${trgtAmount}&_originatingCountry=${syCountryId}&_destinationCountry=${countryRef}`
      })

      const updateICProduct = (product, matchingRate) => {
        if (matchingRate) {
          return {
            ...product,
            fees: matchingRate.charge,
            exRate: matchingRate.settlementRate
          }
        }

        return product
      }

      if (getRates?.list) {
        if (data.length === 1) {
          const matchingRate = getRates.list.find(
            rate => data[0].originAmount >= rate.amountRangeFrom && data[0].originAmount <= rate.amountRangeTo
          )

          const updatedProduct = updateICProduct(data[0], matchingRate)

          if (matchingRate) {
            if (formik.values.lcAmount) formik.setFieldValue('fcAmount', matchingRate.originAmount)
            if (formik.values.fcAmount) formik.setFieldValue('lcAmount', matchingRate.baseAmount)
          }

          !editMode && handleSelectedProduct(updatedProduct)
          console.log(updatedProduct, '!editMod')
          formik.setFieldValue('products', [updatedProduct])
          formik.setFieldValue('products[0].checked', true)
        } else {
          !editMode && handleSelectedProduct()

          const updatedData = data.map(item =>
            item.interfaceId === 1
              ? updateICProduct(
                  item,
                  getRates.list.find(
                    rate => item.originAmount >= rate.amountRangeFrom && item.originAmount <= rate.amountRangeTo
                  )
                )
              : item
          )

          formik.setFieldValue('products', updatedData)
          console.log(updatedData, 'products')
          const matchedIndex = updatedData.findIndex(product => product.productId === data.productId)
          if (matchedIndex) {
            formik.setFieldValue(`products[${matchedIndex}].checked`, true)
          }
        }
      } else {
        console.log(data, 'data')
        displayProduct(data, data.productId)
      }
    } catch (error) {
      await displayProduct(data, data.productId)
    }
  }

  async function displayProduct(data, productId) {
    if (data.length === 1) {
      console.log(data, '!editMod')
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
        await fillProducts(copy)
      }
      await getDefaultVAT()
    })()
  }, [])

  useEffect(() => {
    formik.setFieldValue(
      'amount',
      formik.values.lcAmount + (formik.values.commission + vatAmount - formik.values.tdAmount)
    )
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
            <FormGrid item hideonempty xs={3}>
              <CustomTextField
                name='reference'
                label={labels.Reference}
                value={formik?.values?.reference}
                maxAccess={!editMode && maxAccess}
                maxLength='30'
                readOnly={editMode}
                onChange={formik.handleChange}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={3}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={isClosed || isPosted || editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={3}>
              <ResourceComboBox
                datasetId={DataSets.DOCUMENT_STATUS}
                name='status'
                label={labels.docStatus}
                readOnly
                valueField='key'
                displayField='value'
                values={formik.values}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={3}>
              <CustomDatePicker
                name='valueDate'
                label={labels.valueDate}
                value={formik?.values?.valueDate}
                onChange={formik.setFieldValue}
                readOnly={isClosed || isPosted || editMode}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('valueDate', '')}
                error={formik.touched.valueDate && Boolean(formik.errors.valueDate)}
                helperText={formik.touched.valueDate && formik.errors.valueDate}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={3}>
              <ResourceComboBox
                datasetId={DataSets.WF_STATUS}
                name='wfStatus'
                label={labels.wfStatus}
                readOnly
                valueField='key'
                displayField='value'
                values={formik.values}
              />
            </FormGrid>
            <Grid item xs={9}></Grid>
            <Grid item xs={4.5}>
              <FieldSet title='Transaction Details'>
                <Grid container spacing={2}>
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
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('countryId', newValue ? newValue?.countryId : '')
                        formik.setFieldValue('countryRef', newValue ? newValue?.countryRef : '')
                        formik.setFieldValue('fcAmount', '')
                        formik.setFieldValue('lcAmount', '')
                        handleSelectedProduct(null, true)
                        formik.setFieldValue('products', [])
                        if (!newValue) {
                          formik.setFieldValue('dispersalType', '')
                          formik.setFieldValue('currencyId', '')
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
                      readOnly={isClosed || isPosted || !formik.values.countryId || editMode}
                      name='dispersalType'
                      displayField='dispersalTypeName'
                      valueField='dispersalType'
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('dispersalType', newValue ? newValue?.dispersalType : '')
                        formik.setFieldValue('dispersalTypeName', newValue ? newValue?.dispersalTypeName : '')
                        formik.setFieldValue('beneficiaryId', '')
                        formik.setFieldValue('beneficiaryName', '')
                        if (!newValue) formik.setFieldValue('currencyId', '')
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
                      readOnly={!formik.values.dispersalType || isClosed || isPosted || editMode}
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
                      allowClear={!editMode}
                      readOnly={formik.values.lcAmount || editMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('fcAmount', e.target.value)}
                      onBlur={async () => {
                        if (!formik.values.lcAmount)
                          await fillProducts({
                            countryId: formik.values.countryId,
                            currencyId: formik.values.currencyId,
                            dispersalType: formik.values.dispersalType,
                            lcAmount: formik.values.lcAmount || 0,
                            fcAmount: formik.values.fcAmount || 0
                          })
                      }}
                      onClear={() => {
                        formik.setFieldValue('fcAmount', '')
                        if (!formik.values.lcAmount) {
                          handleSelectedProduct(null, true)
                          formik.setFieldValue('products', [])
                        }
                      }}
                      error={formik.touched.fcAmount && Boolean(formik.errors.fcAmount)}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='lcAmount'
                      label={labels.lcAmount}
                      value={formik.values.lcAmount}
                      required
                      allowClear={!editMode}
                      readOnly={formik.values.fcAmount || editMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('lcAmount', e.target.value)}
                      onBlur={async () => {
                        if (!formik.values.fcAmount)
                          await fillProducts({
                            countryId: formik.values.countryId,
                            currencyId: formik.values.currencyId,
                            dispersalType: formik.values.dispersalType,
                            lcAmount: formik.values.lcAmount || 0,
                            fcAmount: formik.values.fcAmount || 0
                          })
                      }}
                      onClear={() => {
                        formik.setFieldValue('lcAmount', '')
                        if (!formik.values.fcAmount) {
                          handleSelectedProduct(null, true)
                          formik.setFieldValue('products', [])
                        }
                      }}
                      error={formik.touched.lcAmount && Boolean(formik.errors.lcAmount)}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={12}>
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
                  <Grid item xs={6}>
                    <CustomTextField
                      name='corRef'
                      label={labels.corRef}
                      value={formik.values?.corRef}
                      readOnly
                      required={formik.values.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='corName'
                      label={labels.corName}
                      value={formik.values?.corName}
                      readOnly
                      required={formik.values.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate'
                      label={labels.exRateMultiply}
                      value={formik.values.exRate}
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
                      value={formik.values?.exRate ? 1 / formik.values.exRate : ''}
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
                      value={formik.values.commission}
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
                      value={formik.values.tdAmount}
                      maxAccess={maxAccess}
                      onChange={e => {
                        formik.setFieldValue('tdAmount', e.target.value)
                      }}
                      readOnly={editMode}
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
                    <Grid container spacing={2}>
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

                            formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                            formik.setFieldValue('clientName', newValue ? newValue.name : '')
                            formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                            formik.setFieldValue('category', newValue ? newValue.category : 1)
                            await chooseClient(newValue?.recordId, newValue?.category)
                            formik.setFieldValue('beneficiaryId', '')
                            formik.setFieldValue('beneficiaryName', '')
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
                              values={formik.values}
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
                              values={formik.values}
                              onChange={(event, newValue) => {
                                formik.setFieldValue('poeId', newValue ? newValue?.recordId : '')
                              }}
                              required
                              readOnly={editMode}
                              error={formik.touched.poeId && Boolean(formik.errors.poeId)}
                              helperText={formik.touched.poeId && formik.errors.poeId}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <CustomTextArea
                          name='details'
                          label={labels.details}
                          value={formik.values.details}
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
                    readOnly={
                      !formik.values.clientId || !formik.values.dispersalType || isClosed || isPosted || editMode
                    }
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
                <Grid item xs={2}>
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
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
