import { useEffect, useState } from 'react'
import { Grid, Button } from '@mui/material'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useWindow } from 'src/windows'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ReferenceDialog from 'src/components/ReferenceDialog'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import BenificiaryBank from './BenificiaryBank'
import BenificiaryCash from './BenificiaryCash'
import InstantCash from './InstantCash'
import TerraPay from './TerraPay'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ProductsWindow from '../Windows/ProductsWindow'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useInvalidate } from 'src/hooks/resource'
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

export default function OutwardsTab({ labels, recordId, maxAccess, cashAccountId, plantId, userId, window }) {
  const [productsStore, setProductsStore] = useState([])
  const [cashData, setCashData] = useState({})
  const [editMode, setEditMode] = useState(!!recordId)
  const [isClosed, setIsClosed] = useState(false)
  const [isPosted, setIsPosted] = useState(false)
  const [instantReference, setInstantReference] = useState('')
  const [confirmationWindowOpen, setConfirmationWindowOpen] = useState(false)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot
  })

  const [initialValues, setInitialData] = useState({
    recordId: null,
    plantId: plantId,
    cashAccountId: cashAccountId,
    userId: userId,
    productId: '',
    dispersalId: '',
    countryId: '',
    dispersalType: '',
    dispersalTypeName: '',
    currencyId: '',
    idNo: '',
    beneficiaryId: '',
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
    amount: null,
    exRate: null,
    rateCalcMethod: null,
    wip: '',
    status: '',
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
    hiddenInterfaceId: '',
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
    ]
  })

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
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
      clientId: yup.string().required(' '),
      beneficiaryId: yup.string().required(' '),
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
    validate: values => {
      const errors = {}
      if (values.tdAmount > values.commission) {
        errors.tdAmount = ' '
      }

      return errors
    },
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.amountRows
      copy.date = formatDateToApi(copy.date)
      copy.valueDate = formatDateToApi(copy.valueDate)
      copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)

      // Default values for properties if they are empty
      copy.wip = copy.wip === '' ? 1 : copy.wip
      copy.status = copy.status === '' ? 1 : copy.status

      const updatedRows = formik.values.amountRows.map((amountDetails, index) => {
        const seqNo = index + 1 // Adding 1 to make it 1-based index

        return {
          ...amountDetails,
          seqNo: seqNo,
          cashAccountId: cashAccountId,
          outwardId: formik.values.recordId || 0
        }
      })
      if (updatedRows.length == 1 && !updatedRows[0].type) {
        stackError({
          message: `Amount grid not filled. Please fill the grid before saving.`
        })

        return
      }

      const amountGridData = {
        header: copy,
        cash: updatedRows,
        bankType: productFormik.values.interfaceId,
        ICRequest: cashData
      }

      const amountRes = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.set2,
        record: JSON.stringify(amountGridData)
      })

      if (amountRes.recordId) {
        toast.success('Record Updated Successfully')
        formik.setFieldValue('recordId', amountRes.recordId)
        setEditMode(true)

        const res2 = await getRequest({
          extension: RemittanceOutwardsRepository.OutwardsTransfer.get2,
          parameters: `_recordId=${amountRes.recordId}`
        })
        formik.setFieldValue('reference', res2.record.headerView.reference)
        invalidate()
      }
    }
  })

  const total = parseFloat(formik.values.amount || 0)

  const receivedTotal = formik.values.amountRows.reduce((sumAmount, row) => {
    const curValue = parseFloat(row.amount.toString().replace(/,/g, '')) || 0

    return sumAmount + curValue
  }, 0)

  const Balance = total - receivedTotal

  const onClose = async () => {
    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.close,
      record: JSON.stringify({
        recordId: formik.values.recordId
      })
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(true)
    }
  }

  const onReopen = async () => {
    const copy = { ...formik.values }
    delete copy.amountRows
    copy.date = formatDateToApi(copy.date)
    copy.valueDate = formatDateToApi(copy.valueDate)
    copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
    copy.expiryDate = formatDateToApi(copy.expiryDate)

    // Default values for properties if they are empty
    copy.wip = copy.wip === '' ? 1 : copy.wip
    copy.status = copy.status === '' ? 1 : copy.status

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.reopen,
      record: JSON.stringify(copy)
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(false)
    }
  }

  const onPost = async () => {
    const copy = { ...formik.values }
    copy.date = formatDateToApi(copy.date)
    copy.valueDate = formatDateToApi(copy.valueDate)
    copy.defaultValueDate = formatDateToApi(copy.defaultValueDate)
    copy.expiryDate = formatDateToApi(copy.expiryDate)

    // Default values for properties if they are empty
    copy.wip = copy.wip === '' ? 1 : copy.wip
    copy.status = copy.status === '' ? 1 : copy.status

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.post,
      record: JSON.stringify(copy)
    })

    if (res?.recordId) {
      toast.success('Record Posted Successfully')
      setConfirmationWindowOpen(true)
      setInstantReference(res.recordId)
      invalidate()
      setIsPosted(true)
    }
  }

  const productFormik = useFormik({
    initialValues: {
      countryId: '',
      dispersalId: '',
      dispersalName: '',
      dipersalRef: '',
      exRate: '',
      productId: '',
      productName: '',
      productRef: '',
      corId: '',
      fees: '',
      baseAmount: '',
      rateCalcMethod: '',
      checked: 'false',
      exRate2: '',
      interfaceId: '',
      valueDays: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: values => {
      const selectedRowData = productsStore?.list?.find(row => row.checked)
      productFormik.setValues(selectedRowData)
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
      const vatAmount = calcVatAmount(formik, selectedRowData)
      calcAmount(selectedRowData?.baseAmount, selectedRowData?.fees, vatAmount, formik.values.tdAmount)
      calculateValueDate(selectedRowData.valueDays)
      window.close()
    }
  })

  const productDataFill = async formFields => {
    var type = 2
    var functionId = 1
    var plant = formFields?.plantId
    var countryId = formFields?.countryId
    var currencyId = formFields?.currencyId
    var dispersalType = formFields?.dispersalType
    var amount = formFields?.fcAmount ?? 0
    var parameters = `_type=${type}&_functionId=${functionId}&_plantId=${plant}&_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}&_amount=${amount}&_agentId=8`

    if (plant && countryId && currencyId && dispersalType) {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
        parameters: parameters
      })
      if (res.list.length > 0) {
        const newList = { list: res.list }
        setProductsStore(newList)

        if (formFields.recordId) {
          if (!formFields.productId) {
            stackError({
              message: `There's no checked product`
            })
          } else {
            const updatedList = res.list.map(product => {
              if (product.productId === formFields.productId) {
                return { ...product, checked: true }
              }

              return product
            })
            const newUpdatedList = { list: updatedList }
            setProductsStore(newUpdatedList)
            productFormik.setValues(newUpdatedList?.list[0])
          }
        }
      } else {
        formik.setFieldValue('productId', '')
        formik.setFieldValue('commission', null)
        formik.setFieldValue('defaultCommission', null)
        formik.setFieldValue('lcAmount', null)
        formik.setFieldValue('productId', '')
        formik.setFieldValue('dispersalId', '')
        formik.setFieldValue('exRate', null)
        formik.setFieldValue('rateCalcMethod', null)
        formik.setFieldValue('amount', null)
      }
    } else {
      setProductsStore([])
    }
  }

  const fillAmountGridData = async (cash, header) => {
    const modifiedList = cash.map((item, index) => ({
      ...item,
      id: index + 1,
      bankFees: item.bankFees ? parseFloat(item.bankFees).toFixed(2) : null,
      amount: parseFloat(item.amount).toFixed(2)
    }))

    formik.setValues({
      ...header,
      amountRows: modifiedList
    })
  }
  function openReleaventWindow(formValues) {
    if (formValues.dispersalType === 1) {
      stack({
        Component: BenificiaryCash,
        props: {
          clientId: formik.values.clientId,
          corId: formik.values.corId ? formik.values.corId : 0,
          countryId: formik.values.countryId,
          beneficiaryId: formik.values.beneficiaryId
        },
        width: 700,
        height: 500,
        title: 'Cash'
      })
    } else if (formValues.dispersalType === 2) {
      stack({
        Component: BenificiaryBank,
        props: {
          clientId: formik.values.clientId,
          dispersalType: formik.values.dispersalType,
          corId: formik.values.corId ? formik.values.corId : 0,
          countryId: formik.values.countryId,
          beneficiaryId: formik.values.beneficiaryId
        },
        width: 900,
        height: 600,
        title: 'Bank'
      })
    }
  }

  const getClientInfo = async clientId => {
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
    }
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode || isPosted
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || (formik.values.releaseStatus === 3 && formik.values.status === 3) || isPosted
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
      onClick: () => openReleaventWindow(formik.values),
      disabled: formik.values.dispersalType && formik.values.clientId ? false : true
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted || !isClosed
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
        gridData: productsStore,
        maxAccess: maxAccess,
        form: productFormik,
        labels: labels
      },
      width: 900,
      height: 400
    })
  }
  function openBankWindow() {
    if (productFormik.values.interfaceId == 1) {
      stack({
        Component: InstantCash,
        props: {
          onInstantCashSubmit: onInstantCashSubmit,
          cashData: cashData
        },
        width: 1000,
        height: 660,
        title: 'Instant Cash'
      })
    } else if (productFormik.values.interfaceId == 2) {
      stack({
        Component: TerraPay,
        props: {},
        width: 700,
        height: 500,
        title: 'Terra Pay'
      })
    }
  }

  const calcVatAmount = (formik, selectedRowData) => {
    const commission = selectedRowData?.fees
    const vatAmount = (commission * formik.values.vatRate) / 100
    formik.setFieldValue('vatAmount', vatAmount)

    return vatAmount
  }

  const calcAmount = (lcAmount, commission, vatAmount, tdAmount) => {
    const discount = tdAmount ? tdAmount : 0

    const amount = lcAmount + (commission + vatAmount - discount)
    formik.setFieldValue('amount', amount)
  }
  async function getDefaultVAT() {
    var parameters = `_filter=&_key=vatPct`

    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: parameters
    })
    const vatPct = res.record.value

    formik.setFieldValue('vatRate', parseInt(vatPct))
  }
  function onInstantCashSubmit(obj) {
    obj.remitter.primaryId.expiryDate = obj.remitter.primaryId.expiryDate
      ? formatDateToApi(obj.remitter.primaryId.expiryDate)
      : null
    obj.remitter.primaryId.issueDate = obj.remitter.primaryId.issueDate
      ? formatDateToApi(obj.remitter.primaryId.issueDate)
      : null
    obj.remitter.dateOfBirth = obj.remitter.dateOfBirth ? formatDateToApi(obj.remitter.dateOfBirth) : null
    obj.beneficiary.dateOfBirth = obj.beneficiary.dateOfBirth ? formatDateToApi(obj.beneficiary.dateOfBirth) : null
    setCashData(obj)
  }
  function calculateValueDate(valueDays) {
    const newDate = new Date(formik.values.date)
    newDate.setDate(newDate.getDate() + valueDays)
    formik.setFieldValue('valueDate', newDate)
  }
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.OutwardsTransfer.get2,
            parameters: `_recordId=${recordId}`
          })
          setIsClosed(res.record.headerView.wip === 2 ? true : false)
          setIsPosted(res.record.headerView.status === 3 ? true : false)
          res.record.headerView.date = formatDateFromApi(res.record.headerView.date)
          res.record.headerView.defaultValueDate = formatDateFromApi(res.record.headerView.defaultValueDate)
          res.record.headerView.valueDate = formatDateFromApi(res.record.headerView.valueDate)
          res.record.checked = true
          getClientInfo(res.record.headerView.clientId)
          fillAmountGridData(res.record.cash, res.record.headerView)
          productDataFill(res.record.headerView)
        }
        getDefaultVAT()
      } catch (error) {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ReferenceDialog
        DialogText={`Instant Cash Referenece: ${instantReference} `}
        okButtonAction={() => setConfirmationWindowOpen(false)}
        openCondition={confirmationWindowOpen}
      />
      <FormShell
        resourceId={ResourceIds.OutwardsTransfer}
        form={formik}
        editMode={editMode}
        height={480}
        maxAccess={maxAccess}
        onClose={onClose}
        onReopen={onReopen}
        isClosed={isClosed}
        actions={actions}
        previewReport={editMode}
        functionId={SystemFunction.Outwards}
        disabledSubmit={isPosted}
      >
        <Grid container sx={{ pt: 2 }}>
          {/* First Column */}
          <Grid container rowGap={2} xs={12} spacing={2} sx={{ px: 2, pt: 2, pb: 2 }}>
            <FormGrid item hideonempty xs={2.4}>
              <CustomTextField
                name='reference'
                label={labels.Reference}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly
                required
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
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
                    if (!newValue) formik.setFieldValue('currencyId', '')
                  }}
                  error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={
                    formik.values.countryId && formik.values.dispersalType && RemittanceOutwardsRepository.Currency.qry
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
                  onClear={() => formik.setFieldValue('fcAmount', '')}
                  onBlur={() => {
                    if (formik.values.fcAmount) productDataFill(formik.values)
                  }}
                  error={formik.touched.fcAmount && Boolean(formik.errors.fcAmount)}
                  maxLength={10}
                />
              </Grid>
              <Grid item xs={2}>
                <Button sx={{ backgroundColor: '#908c8c', color: '#000000' }} onClick={() => openProductWindow()}>
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
                  required
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
                    value={formik?.values?.exRate ? 1 / formik.values.exRate : null}
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
                    value={formik.values.vatAmount}
                    readOnly
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('vatAmount', e.target.value)}
                    onClear={() => formik.setFieldValue('vatAmount', '')}
                    error={formik.touched.vatAmount && Boolean(formik.errors.vatAmount)}
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
                    calcAmount(
                      formik.values.lcAmount,
                      formik.values.commission,
                      formik.values.vatAmount,
                      e.target.value
                    )
                  }}
                  onClear={() => formik.setFieldValue('tdAmount', '')}
                  error={formik.touched.tdAmount && Boolean(formik.errors.tdAmount)}
                  maxLength={10}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomNumberField
                  name='amount'
                  label={labels.NetToPay}
                  value={formik.values.amount}
                  required
                  readOnly
                  maxAccess={maxAccess}
                  onChange={e => formik.setFieldValue('amount', e.target.value)}
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
                    await getClientInfo(newValue?.recordId)
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
                    dir='rtl' // Set direction to right-to-left
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
                    dir='rtl' // Set direction to right-to-left
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
                    dir='rtl' // Set direction to right-to-left
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
                    dir='rtl' // Set direction to right-to-left
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
                  _dispersalType: formik.values.dispersalType
                }}
                valueField='name'
                displayField='name'
                name='beneficiaryName'
                label={labels.Beneficiary}
                form={formik}
                required
                readOnly={!formik.values.clientId || !formik.values.dispersalType || isClosed || isPosted}
                maxAccess={maxAccess}
                editMode={editMode}
                secondDisplayField={false}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('beneficiaryId', newValue?.beneficiaryId)
                  formik.setFieldValue('beneficiaryName', newValue?.name)
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

            <Grid container sx={{ pb: 15 }}>
              <FieldSet title='Amount'>
                <Grid width={'100%'}>
                  <DataGrid
                    onChange={value => formik.setFieldValue('amountRows', value)}
                    value={formik.values.amountRows}
                    error={formik.errors.amountRows}
                    disabled={isClosed}
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
      </FormShell>
    </>
  )
}
