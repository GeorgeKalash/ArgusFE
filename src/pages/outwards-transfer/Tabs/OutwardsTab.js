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
import { CurrencyTradingClientRepository } from 'src/repositories/CurrencyTradingClientRepository'
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

export default function OutwardsTab({ _labels, recordId, maxAccess, cashAccountId, plantId, userId, window }) {
  const [position, setPosition] = useState()
  const [productsStore, setProductsStore] = useState([])
  const [editMode, setEditMode] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.page
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
    agentId: '',
    idNo: '',
    clientId: '',
    clientRef: '',
    clientName: '',
    idType: '',
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
    date: new Date()
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
    checked: 'false'
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      dispersalType: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required'),
      agentId: yup.string().required('This field is required'),
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
      copy.beneficiaryId = 1

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.set,
        record: JSON.stringify(copy)
      })

      if (res.recordId) {
        toast.success('Record Updated Successfully')
        formik.setFieldValue('recordId', res.recordId)

        const res2 = await getRequest({
          extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
          parameters: `_recordId=${res.recordId}`
        })
        formik.setFieldValue('reference', res2.record.reference)
        invalidate()
      }
    }
  })

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
    var agentId = formFields?.agentId ?? 0
    var amount = formFields?.fcAmount ?? 0

    var parameters = `_type=${type}&_functionId=${functionId}&_plantId=${plant}&_countryId=${countryId}&_dispersalType=${dispersalType}&_currencyId=${currencyId}&_agentId=${agentId}&_amount=${amount}`

    getRequest({
      extension: RemittanceOutwardsRepository.ProductDispersalEngine.qry,
      parameters: parameters
    })
      .then(res => {
        const newList = { list: res.list }
        setProductsStore(newList)
      })
      .catch(error => {})
  }

  function openReleaventWindow(formValues) {
    if (formValues.dispersalType === 1) {
      stack({
        Component: BenificiaryCash,
        props: {},
        width: 700,
        height: 500,
        title: 'Cash'
      })
    } else if (formValues.dispersalType === 2) {
      stack({
        Component: BenificiaryBank,
        props: {},
        width: 900,
        height: 650,
        title: 'Bank'
      })
    }
  }

  const getIDinfo = async clientId => {
    const res = await getRequest({
      extension: CTCLRepository.IDNumber.get2,
      parameters: `_clientId=${clientId}`
    })
    formik.setFieldValue('idNo', res?.record?.idNo)
    formik.setFieldValue('idType', res?.record?.idtId)
    formik.setFieldValue('nationalityId', res?.record?.idCountryId)
  }

  /* const onIdNoBlur = idNo => {
    var parameters = `_idNo=${idNo}`

    getRequest({
      extension: CurrencyTradingClientRepository.Identity.get,
      parameters: parameters
    })
      .then(res => {
        if (res?.record?.clientId) {
          var clientParameters = `_recordId=${res?.record?.clientId}`
          getRequest({
            extension: CurrencyTradingClientRepository.Client.get,
            parameters: clientParameters
          }).then(clientRes => {
            console.log(clientRes)
            if (clientRes?.record) {
              formik.setFieldValue('cl_reference', clientRes?.record?.reference)
              formik.setFieldValue('cl_name', clientRes?.record?.name)
              formik.setFieldValue('idType', res?.record?.idtId)
              formik.setFieldValue('nationalityId', clientRes?.record?.nationalityId)
            }
          })
        } //clear the id field or show a message that there isn't any client with this ID
        else {
          formik.setFieldValue('idNo', '')
          formik.setFieldValue('cl_reference', '')
          formik.setFieldValue('cl_name', '')
          formik.setFieldValue('idType', '')
          formik.setFieldValue('nationalityId', '')
        }
      })
      .catch(error => {})
  }*/

  const actions = [
    {
      key: 'Beneficiary',
      condition: true,
      onClick: () => openReleaventWindow(formik.values),
      disabled: false
    }
  ]
  function openProductWindow() {
    stack({
      Component: ProductsWindow,
      props: {
        gridData: productsStore,
        maxAccess: maxAccess,
        form: productFormik,
        _labels: _labels
      },
      width: 800,
      height: 400

      //title: labels[1]
    })
  }
  console.log('formik ', formik.values)
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
            parameters: `_recordId=${recordId}`
          })
          res.record.date = formatDateFromApi(res.record.date)
          formik.setValues(res.record)
          formik.setFieldValue('net', parseInt(res.record.commission) + parseInt(res.record.lcAmount))
          res.record.checked = true
          productDataFill(res.record)
          getIDinfo(res.record.clientId)
        }
      } catch (error) {}
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <FormShell
        resourceId={ResourceIds.OutwardsTransfer}
        form={formik}
        height={480}
        maxAccess={maxAccess}
        actions={actions}
      >
        <Grid container sx={{ pt: 2 }}>
          {/* First Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={_labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceOutwardsRepository.Country.qry}
                name='countryId'
                label={_labels.Country}
                required
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
                label={_labels.DispersalType}
                required
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
                label={_labels.Currency}
                required
                name='currencyId'
                displayField={['currencyRef', 'currencyName']}
                columnsInDropDown={[
                  { key: 'currencyRef', value: 'Reference' },
                  { key: 'currencyName', value: 'Name' }
                ]}
                valueField='currencyId'
                values={formik.values}
                readOnly={formik.values.dispersalType == ''}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.currencyId)
                }}
                error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={
                  formik.values.countryId &&
                  formik.values.dispersalType &&
                  formik.values.currencyId &&
                  RemittanceOutwardsRepository.Agent.qry
                }
                parameters={`_dispersalType=${formik.values.dispersalType}&_countryId=${formik.values.countryId}&_currencyId=${formik.values.currencyId}`}
                label={_labels.Agent}
                required={formik.values.dispersalType === 2}
                readOnly={formik.values.dispersalType !== 2}
                name='agentId'
                displayField='agentName'
                valueField='agentId'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('agentId', newValue?.agentId)
                }}
                error={formik.touched.agentId && Boolean(formik.errors.agentId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CTCLRepository.ClientCorporate.snapshot}
                parameters={{
                  _category: 0
                }}
                valueField='reference'
                displayField='name'
                name='clientId'
                label={_labels.Client}
                form={formik}
                required
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
                    await getIDinfo(newValue?.recordId)
                  } else {
                    formik.setFieldValue('clientId', null)
                    formik.setFieldValue('clientName', null)
                    formik.setFieldValue('clientRef', null)
                  }
                }}
                errorCheck={'clientId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='idNo'
                label={_labels.IdNo}
                value={formik.values.idNo}
                readOnly={editMode}
                required
                onChange={formik.handleChange}
                onBlur={() => {
                  //if (formik.values.idNo) onIdNoBlur(formik.values.idNo)
                }}
                onClear={() => formik.setFieldValue('idNo', '')}
                error={formik.touched.idNo && Boolean(formik.errors.idNo)}
                helperText={formik.touched.idNo && formik.errors.idNo}
                maxLength='15'
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                label={_labels.IdType}
                required
                name='idType'
                displayField='name'
                valueField='recordId'
                readOnly
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('idType', newValue?.recordId)
                }}
                error={formik.touched.idType && Boolean(formik.errors.idType)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                label={_labels.Nationality}
                required
                name='nationalityId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                values={formik.values}
                readOnly
                onChange={(event, newValue) => {
                  formik.setFieldValue('nationalityId', newValue?.recordId)
                }}
                error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={_labels.Reference}
                value={formik?.values?.reference}
                editMode={editMode}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={true}
                required
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                position={position}
                name='fcAmount'
                type='text'
                label={_labels.Amount}
                value={formik.values.fcAmount}
                required
                readOnly={
                  (formik.values.dispersalType == 2 && formik.values.agentId != null) ||
                  (formik.values.dispersalType == 1 && formik.values.agentId === null)
                    ? false
                    : true
                }
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
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                valueField='reference'
                displayField='name'
                name='corId'
                label={_labels.Correspondant}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='corRef'
                secondValueShow='corName'
                maxAccess={maxAccess}
                editMode={editMode}
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
            <Button onClick={() => openProductWindow()}>Open Popup</Button>
            <Grid item xs={12}>
              <CustomTextField
                position={position}
                name='commission'
                type='text'
                label={_labels.Fees}
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
                position={position}
                name='lcAmount'
                type='text'
                label={_labels.BaseAmount}
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
                name='net'
                type='text'
                label={_labels.NetToPay}
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
          </Grid>
        </Grid>
      </FormShell>
    </>
  )
}
