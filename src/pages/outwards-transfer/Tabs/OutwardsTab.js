import { useEffect, useState } from 'react'

// ** MUI Imports
import { Grid, Button } from '@mui/material'
import { getFormattedNumberMax } from 'src/lib/numberField-helper'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useWindow } from 'src/windows'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import BenificiaryBank from './BenificiaryBank'
import BenificiaryCash from './BenificiaryCash'
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
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import FormGrid from 'src/components/form/layout/FormGrid'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

export default function OutwardsTab({ labels, recordId, maxAccess, cashAccountId, plantId, userId, window }) {
  const [position, setPosition] = useState()
  const [productsStore, setProductsStore] = useState([])
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [isClosed, setIsClosed] = useState(false)
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
    fcAmount: '',
    corId: '',
    corRef: '',
    corName: '',
    commission: '',
    lcAmount: '',
    net: '',
    exRate: '',
    rateCalcMethod: '',
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
    purposeOfExchange: '',
    docStatus: '',
    ttNo: '',
    tokenNo: '',
    valueDate: null,
    vatRate: '',
    discount: '',
    giftCode: '',
    details: '',
    paymentMethod: ''
  })

  const [initialValues2, setInitialData2] = useState({
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
    exchangeRate: '',
    exchangeRate2: ''
  })

  const fillProfessionStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: RemittanceSettingsRepository.Profession.qry,
      parameters: parameters
    })
      .then(res => {
        setProfessionFilterStore(res.list)
      })
      .catch(error => {})
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      idNo: yup.string().required('This field is required'),
      fcAmount: yup.string().required('This field is required'),
      productId: yup.string().required('This field is required'),
      commission: yup.string().required('This field is required'),
      lcAmount: yup.string().required('This field is required')
    }),
    onSubmit: async values => {
      const copy = { ...values }
      copy.date = formatDateToApi(copy.date)

      // Default values for properties if they are empty
      copy.wip = copy.wip === '' ? 1 : copy.wip
      copy.status = copy.status === '' ? 1 : copy.status

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.set,
        record: JSON.stringify(copy)
      })

      if (res.recordId) {
        toast.success('Record Updated Successfully')
        formik.setFieldValue('recordId', res.recordId)
        setEditMode(true)

        const res2 = await getRequest({
          extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
          parameters: `_recordId=${res.recordId}`
        })
        formik.setFieldValue('reference', res2.record.reference)
        invalidate()
      }
    }
  })

  const onClose = async () => {
    const obj = formik.values
    const copy = { ...obj }
    copy.date = formatDateToApi(copy.date)

    // Default values for properties if they are empty
    copy.wip = copy.wip === '' ? 1 : copy.wip
    copy.status = copy.status === '' ? 1 : copy.status

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.close,
      record: JSON.stringify(copy)
    })

    if (res.recordId) {
      toast.success('Record Closed Successfully')
      invalidate()
      setIsClosed(true)
    }
  }

  const onReopen = async () => {
    const obj = formik.values
    const copy = { ...obj }
    copy.date = formatDateToApi(copy.date)

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

  const productFormik = useFormik({
    initialValues: initialValues2,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: values => {
      const selectedRowData = productsStore?.list?.find(row => row.checked)
      formik.setFieldValue('productId', selectedRowData?.productId)
      formik.setFieldValue('commission', selectedRowData?.fees)
      formik.setFieldValue('lcAmount', selectedRowData?.baseAmount)
      formik.setFieldValue('productId', selectedRowData?.productId)
      formik.setFieldValue('dispersalId', selectedRowData?.dispersalId)
      formik.setFieldValue('exRate', selectedRowData?.exRate)
      formik.setFieldValue('rateCalcMethod', selectedRowData?.rateCalcMethod)
      formik.setFieldValue('net', selectedRowData?.fees + selectedRowData?.baseAmount || '')
      formik.setFieldValue('exchangeRate', selectedRowData?.exRate)
      formik.setFieldValue('exchangeRate2', (1 / selectedRowData?.exRate).toFixed(5))
      window.close()
    }
  })

  const productDataFill = formFields => {
    //get products list
    var type = 2
    var functionId = 1
    var plant = formFields?.plantId
    var countryId = formFields?.countryId
    var currencyId = formFields?.currencyId
    var dispersalType = formFields?.dispersalType
    var amount = formFields?.fcAmount ?? 0
    var parameters = `_type=${type}&_functionId=${functionId}&_plantId=${plant}&_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}&_amount=${amount}&_agentId=8`

    if (plant && countryId && currencyId && dispersalType) {
      getRequest({
        extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
        parameters: parameters
      })
        .then(res => {
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
              }
            }
          } else {
            formik.setFieldValue('productId', '')
            formik.setFieldValue('commission', '')
            formik.setFieldValue('lcAmount', '')
            formik.setFieldValue('productId', '')
            formik.setFieldValue('dispersalId', '')
            formik.setFieldValue('exRate', '')
            formik.setFieldValue('rateCalcMethod', '')
            formik.setFieldValue('net', '')
          }
        })
        .catch(error => {})
    } else {
      setProductsStore([])
    }
  }

  function openReleaventWindow(formValues) {
    if (formValues.dispersalType === 1) {
      stack({
        Component: BenificiaryCash,
        props: {
          clientId: formik.values.clientId,
          dispersalType: formik.values.dispersalType,
          corId: formik.values.corId,
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
          corId: formik.values.corId,
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
    const res = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get,
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
      disabled: !isClosed || !editMode || (formik.values.releaseStatus === 3 && formik.values.status === 3)
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
      width: 800,
      height: 400
    })
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

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
            parameters: `_recordId=${recordId}`
          })
          setIsClosed(res.record.wip === 2 ? true : false)
          res.record.date = formatDateFromApi(res.record.date)
          formik.setValues(res.record)
          formik.setFieldValue('net', parseInt(res.record.commission) + parseInt(res.record.lcAmount))
          res.record.checked = true
          productDataFill(res.record)
          getClientInfo(res.record.clientId)
          fillProfessionStore()
        }
        getDefaultVAT()
      } catch (error) {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*  useEffect(() => {
    if (formik.values.beneficiaryId) {
      console.log('enter cond')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.beneficiaryId])*/

  return (
    <>
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
        functionId={SystemFunction.Outwards}
      >
        <Grid container sx={{ pt: 2 }}>
          {/* First Column */}
          <Grid container rowGap={2} xs={12} spacing={2} sx={{ px: 2, pt: 2, pb: 2 }}>
            <FormGrid item hideonempty xs={3}>
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
            <FormGrid item hideonempty xs={3}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={3}>
              <ResourceComboBox
                datasetId={DataSets.DOCUMENT_STATUS}
                name='docStatus'
                label={labels.docStatus}
                readOnly
                valueField='key'
                displayField='value'
                values={formik.values}
                onClear={() => formik.setFieldValue('docStatus', '')}
                onChange={(event, newValue) => {
                  formik.setFieldValue('docStatus', newValue?.key || '')
                }}
                error={formik.touched.docStatus && Boolean(formik.errors.docStatus)}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={3}>
              <CustomTextField
                name='tokenNo'
                label={labels.tokenNo}
                value={formik.values?.tokenNo}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('tokenNo', '')}
                error={formik.touched.tokenNo && Boolean(formik.errors.tokenNo)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={3}>
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
            <FormGrid item hideonempty xs={3}>
              <CustomDatePicker
                name='valueDate'
                label={labels.valueDate}
                value={formik?.values?.valueDate}
                onChange={formik.setFieldValue}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('valueDate', '')}
                error={formik.touched.valueDate && Boolean(formik.errors.valueDate)}
                helperText={formik.touched.valueDate && formik.errors.valueDate}
              />
            </FormGrid>
          </Grid>

          <Grid container rowGap={2} xs={4} spacing={2} sx={{ px: 2, pt: 2 }}>
            <FieldSet title='Transaction Details'>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={RemittanceOutwardsRepository.Country.qry}
                  name='countryId'
                  label={labels.Country}
                  required
                  readOnly={isClosed}
                  displayField={['countryRef', 'countryName']}
                  columnsInDropDown={[
                    { key: 'countryRef', value: 'Reference' },
                    { key: 'countryName', value: 'Name' }
                  ]}
                  valueField='countryId'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('countryId', newValue?.countryId)
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
                  readOnly={isClosed}
                  name='dispersalType'
                  displayField='dispersalTypeName'
                  valueField='dispersalType'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('dispersalType', newValue?.dispersalType)
                    formik.setFieldValue('dispersalTypeName', newValue?.dispersalTypeName)
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
                  readOnly={formik.values.dispersalType == '' || isClosed}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('currencyId', newValue?.currencyId)
                  }}
                  error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  position={position}
                  name='fcAmount'
                  numberField={true}
                  label={labels.fcAmount}
                  value={formik.values.fcAmount}
                  required
                  readOnly={!formik.values.dispersalType || isClosed}
                  maxAccess={maxAccess}
                  onChange={e => {
                    const input = e.target
                    const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                    // Save current cursor position
                    const currentPosition = input.selectionStart

                    // Update field value
                    formik.setFieldValue('fcAmount', formattedValue)

                    // Calculate the new cursor position based on the formatted value
                    const newCursorPosition =
                      currentPosition + (formattedValue && formattedValue.length - input.value.length)

                    setPosition(newCursorPosition)
                  }}
                  onBlur={() => {
                    if (formik.values.fcAmount) productDataFill(formik.values)
                  }}
                  onClear={() => formik.setFieldValue('fcAmount', '')}
                  error={formik.touched.fcAmount && Boolean(formik.errors.fcAmount)}
                  helperText={formik.touched.fcAmount && formik.errors.fcAmount}
                />
              </Grid>
              <Grid item xs={2}>
                <Button sx={{ backgroundColor: '#D3D3D3', color: '#000000' }} onClick={() => openProductWindow()}>
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
                    if (newValue) {
                      formik.setFieldValue('corId', newValue?.recordId)
                      formik.setFieldValue('corName', newValue?.name || '')
                      formik.setFieldValue('corRef', newValue?.reference || '')
                    } else {
                      formik.setFieldValue('corId', null)
                      formik.setFieldValue('corName', null)
                      formik.setFieldValue('corRef', null)
                    }
                  }}
                  errorCheck={'corId'}
                />
              </Grid>
              <Grid container xs={12} spacing={1} sx={{ pt: 2, pl: 2 }}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='exchangeRate'
                    label={labels.exchangeRate}
                    value={formik.values?.exchangeRate}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('exchangeRate', '')}
                    error={formik.touched.exchangeRate && Boolean(formik.errors.exchangeRate)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='exchangeRate2'
                    label={labels.exchangeRate}
                    value={formik.values?.exchangeRate2}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('exchangeRate2', '')}
                    error={formik.touched.exchangeRate2 && Boolean(formik.errors.exchangeRate2)}
                    maxAccess={maxAccess}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  position={position}
                  name='lcAmount'
                  numberField={true}
                  label={labels.lcAmount}
                  value={formik.values.lcAmount}
                  required
                  readOnly
                  maxAccess={maxAccess}
                  onChange={e => {
                    const input = e.target
                    const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                    // Save current cursor position
                    const currentPosition = input.selectionStart

                    // Calculate the new cursor position based on the formatted value
                    const newCursorPosition =
                      currentPosition + (formattedValue && formattedValue.length - input.value.length)

                    setPosition(newCursorPosition)
                  }}
                  error={formik.touched.lcAmount && Boolean(formik.errors.lcAmount)}
                  helperText={formik.touched.lcAmount && formik.errors.lcAmount}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  position={position}
                  name='commission'
                  numberField={true}
                  label={labels.commission}
                  value={formik.values.commission}
                  required
                  readOnly
                  maxAccess={maxAccess}
                  onChange={e => {
                    const input = e.target
                    const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                    // Save current cursor position
                    const currentPosition = input.selectionStart

                    // Calculate the new cursor position based on the formatted value
                    const newCursorPosition =
                      currentPosition + (formattedValue && formattedValue.length - input.value.length)

                    setPosition(newCursorPosition)
                  }}
                  error={formik.touched.commission && Boolean(formik.errors.commission)}
                  helperText={formik.touched.commission && formik.errors.commission}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='vatRate'
                  numberField={true}
                  label={labels.vatRate}
                  value={formik.values.vatRate}
                  readOnly
                  maxAccess={maxAccess}
                  error={formik.touched.vatRate && Boolean(formik.errors.vatRate)}
                  helperText={formik.touched.vatRate && formik.errors.vatRate}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='discount'
                  numberField={true}
                  label={labels.discount}
                  value={formik.values.discount}
                  readOnly={isClosed}
                  maxAccess={maxAccess}
                  error={formik.touched.discount && Boolean(formik.errors.discount)}
                  helperText={formik.touched.discount && formik.errors.discount}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  position={position}
                  name='net'
                  numberField={true}
                  label={labels.NetToPay}
                  value={formik.values.net}
                  required
                  readOnly
                  maxAccess={maxAccess}
                  onChange={e => {
                    const input = e.target
                    const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

                    // Save current cursor position
                    const currentPosition = input.selectionStart

                    // Calculate the new cursor position based on the formatted value
                    const newCursorPosition =
                      currentPosition + (formattedValue && formattedValue.length - input.value.length)

                    setPosition(newCursorPosition)
                  }}
                  error={formik.touched.net && Boolean(formik.errors.net)}
                  helperText={formik.touched.net && formik.errors.net}
                />
              </Grid>
            </FieldSet>
          </Grid>
          <Grid container rowGap={2} xs={8} spacing={2} sx={{ px: 2, pt: 2 }}>
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
                  readOnly={isClosed}
                  displayFieldWidth={2}
                  valueShow='clientRef'
                  secondValueShow='clientName'
                  maxAccess={maxAccess}
                  editMode={editMode}
                  onChange={async (event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('clientId', newValue?.recordId)
                      formik.setFieldValue('clientName', newValue?.name || '')
                      formik.setFieldValue('clientRef', newValue?.reference || '')
                      await getClientInfo(newValue?.recordId)
                    } else {
                      formik.setFieldValue('clientId', null)
                      formik.setFieldValue('clientName', null)
                      formik.setFieldValue('clientRef', null)
                      formik.setFieldValue('beneficiaryId', '')
                      formik.setFieldValue('beneficiaryName', '')
                    }
                  }}
                  errorCheck={'clientId'}
                />
              </Grid>
              <Grid container xs={12} spacing={2} sx={{ pl: '10px' }}>
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
              <Grid container xs={12} spacing={2} sx={{ flexDirection: 'row-reverse', pl: '10px' }}>
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
              <Grid container>
                {/* First Column */}
                <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
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
                      required
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
                    <ResourceComboBox
                      endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                      name='purposeOfExchange'
                      label={labels.purposeOfExchange}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      readOnly
                      values={formik.values}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          formik.setFieldValue('purposeOfExchange', newValue?.recordId)
                        } else {
                          formik.setFieldValue('purposeOfExchange', '')
                        }
                      }}
                      error={formik.touched.purposeOfExchange && Boolean(formik.errors.purposeOfExchange)}
                      helperText={formik.touched.purposeOfExchange && formik.errors.purposeOfExchange}
                    />
                  </Grid>
                  <Grid item xs={6}>
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
                </Grid>
                {/* Second Column */}
                <Grid container rowGap={2} sx={{ px: 2, width: '300px' }}>
                  <Grid item xs={6}>
                    <CustomTextArea
                      name='details'
                      label={labels.details}
                      value={formik.values.details}
                      rows={3}
                      maxLength='100'
                      sx={{ width: '300px' }}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('details', e.target.value)}
                      onClear={() => formik.setFieldValue('details', '')}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </FieldSet>
            <Grid item xs={5}>
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
                readOnly={!formik.values.clientId || !formik.values.dispersalType || isClosed}
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
            <Grid item xs={5}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                label={labels.paymentMethod}
                valueField='key'
                displayField='value'
                values={formik.values}
                onClear={() => formik.setFieldValue('paymentMethod', '')}
                onChange={(event, newValue) => {
                  formik.setFieldValue('paymentMethod', newValue?.key || '')
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
              />
            </Grid>
          </Grid>
        </Grid>
      </FormShell>
    </>
  )
}
