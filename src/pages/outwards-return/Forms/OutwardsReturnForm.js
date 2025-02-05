import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataSets } from 'src/resources/DataSets'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { useWindow } from 'src/windows'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function OutwardsReturnForm({
  labels,
  maxAccess: access,
  recordId,
  plantId,
  dtId,
  isOpenOutwards = false,
  refetch
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.OutwardsReturn,
    access,
    hasDT: false
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.OutwardsReturn.page
  })

  async function getOutwardsReturn(recordId) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsReturn.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function getOutwardsTransfer(recordId) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
      parameters: `_recordId=${recordId}`
    })
  }

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      dtId: dtId || null,
      reference: '',
      owt_Id: null,
      owt_reference: '',
      owt_rateCalcMethod: null,
      owt_exRate: null,
      ad_exRate: null,
      ad_rateCalcMethod: null,
      exRateChangeStatus: null,
      requestedBy: null,
      date: new Date(),
      currencyId: null,
      corId: null,
      clientId: null,
      cashAccountId: null,
      wip: 1,
      status: 1,
      corReplyStatus: null,
      plantName: null,
      plantRef: null,
      currencyName: null,
      currencyRef: null,
      corName: null,
      corRef: null,
      plantId: parseInt(plantId),
      cashAccountName: null,
      cashAccountRef: null,
      fcAmount: '',
      productId: '',
      productName: '',
      dispersalType: null,
      dispersalName: null,
      corCurrencyId: null,
      corRateCalcMethod: null,
      corExRate: null,
      commission: null,
      vatAmount: null,
      tdAmount: null,
      amount: null,
      exRate: null,
      rateCalcMethod: null,
      lcAmount: '',
      releaseStatus: null,
      otpVerified: false,
      settlementStatus: 1,
      interfaceId: null,
      attemptNo: 1
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      owt_Id: yup.number().required(),
      owt_reference: yup.string().required(),
      requestedBy: yup.string().required(),
      currencyId: yup.string().required(),
      clientId: yup.number().required(),
      corId: yup.number().required(),
      fcAmount: yup.string().required(),
      dispersalName: yup.string().required(),
      vatAmount: yup.string().required(),
      settlementStatus: yup.number().required(),
      lcAmount: yup
        .string()
        .required()
        .test(function (value) {
          const { amount } = this.parent

          return parseFloat(value) <= parseFloat(amount || 0)
        }),
      exRate: yup.string().required(),
      commission: yup.string().required(),
      amount: yup.string().required()
    }),
    onSubmit: async obj => {
      const copy = { ...obj }
      copy.date = formatDateToApi(copy.date)

      const response = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsReturn.set,
        record: JSON.stringify(copy)
      })

      if (response.recordId) {
        toast.success(platformLabels.Added)
        const res2 = await getOutwardsReturn(response.recordId)

        formik.setValues({
          ...res2.record,
          cellPhone: res2.record.cellPhone,
          date: formatDateFromApi(res2.record.date)
        })
        !recordId && viewOTP(response.recordId)
        if (isOpenOutwards) {
          refetch()
        }
        fillForm(response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  async function getRaCurrencyId() {
    const raCurrencyId = defaultsData?.list?.find(({ key }) => key === 'baseCurrencyId')?.value
    if (raCurrencyId) {
      await formik.setFieldValue('raCurrencyId', raCurrencyId)
    }

    return raCurrencyId
  }

  const calculateLcAmount = (fcAmount, adExRate, adRateCalcMethod) => {
    const derivedLcAmount = adRateCalcMethod === 1 ? fcAmount * adExRate : fcAmount / adExRate

    return derivedLcAmount
  }

  function viewOTP(recId) {
    stack({
      Component: OTPPhoneVerification,
      props: {
        values: formik.values,
        recordId: recId,
        functionId: SystemFunction.OutwardsReturn
      },
      width: 400,
      height: 400,
      title: labels.OTPVerification
    })
  }

  const editMode = !!formik.values.recordId

  const isClosed = formik.values.wip === 2

  const onClose = async recId => {
    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsReturn.close,
      record: JSON.stringify({
        recordId: formik.values.recordId ?? recId
      })
    })

    if (res.recordId) {
      toast.success(platformLabels.Closed)
      invalidate()
      fillForm(res.recordId)
    }
  }

  const onReopen = async () => {
    const copy = { ...formik.values }
    copy.date = formatDateToApi(copy.date)

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsReturn.reopen,
      record: JSON.stringify(copy)
    })

    if (res.recordId) {
      toast.success(platformLabels.Reopened)
      invalidate()

      fillForm(res.recordId)
    }
  }
  const isPosted = formik.values.status === 3

  const onPost = async () => {
    const copy = { ...formik.values }
    copy.date = formatDateToApi(copy.date)

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsReturn.post,
      record: JSON.stringify(copy)
    })

    if (res.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()

      fillForm(res.recordId)
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
      disabled: !isClosed || isPosted
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: isPosted || !editMode || !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  const fillForm = async recordId => {
    const raCurrencyId = await getRaCurrencyId()
    const res = await getOutwardsReturn(recordId)
    const outwardTransfer = await getOutwardsTransfer(res?.record?.owt_Id)

    if (raCurrencyId) {
      const data = await getData(
        res.record.plantId,
        res.record?.currencyId,
        outwardTransfer?.record?.rateTypeId,
        raCurrencyId
      )

      const rate = parseFloat(data?.rate)
      if (isNaN(rate)) {
        return
      }

      const fcAmount = parseFloat(outwardTransfer?.record?.fcAmount || 0)
      const owtLcAmount = parseFloat(outwardTransfer?.record?.lcAmount || 0)
      const adRateCalcMethod = parseInt(outwardTransfer?.record?.rateCalcMethod, 10)

      const derivedLcAmount = calculateLcAmount(fcAmount, rate, adRateCalcMethod)

      formik.setValues({
        ...res.record,
        amount: outwardTransfer?.record?.amount,
        owt_lcAmount: outwardTransfer?.record?.lcAmount,
        derivedLcAmount: derivedLcAmount,
        date: formatDateFromApi(res.record.date)
      })
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        fillForm(recordId)
      }
    })()
  }, [])

  async function getData(plantId, currencyId, rateTypeId, raCurrencyId) {
    if (plantId && currencyId && rateTypeId && raCurrencyId) {
      const res = await getRequest({
        extension: CurrencyTradingSettingsRepository.ExchangeMap.get,
        parameters: `_plantId=${plantId}&_currencyId=${currencyId}&_rateTypeId=${rateTypeId}&_raCurrencyId=${raCurrencyId}`
      })

      return res.record
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId || editMode) {
        await getRaCurrencyId()
      }
    })()
  }, [recordId, editMode])

  const getExRateChangeStatus = (beforeAmount, afterAmount) => {
    if (beforeAmount === afterAmount) formik.setFieldValue('exRateChangeStatus', '1')
    if (beforeAmount < afterAmount) formik.setFieldValue('exRateChangeStatus', '3')
    if (beforeAmount > afterAmount) formik.setFieldValue('exRateChangeStatus', '2')
  }

  return (
    <FormShell
      resourceId={ResourceIds.OutwardsReturn}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      functionId={SystemFunction.OutwardsReturn}
      disabledSubmit={isOpenOutwards ? false : isPosted || isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2} sx={{ pt: 5, display: 'flex' }}>
            <Grid container item xs={12} spacing={2} sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item xs={6}>
                <FieldSet title='Outwards Transfer'>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik?.values?.reference}
                      maxAccess={!editMode && maxAccess}
                      maxLength='30'
                      readOnly={editMode || isPosted || isClosed}
                      onChange={formik.handleChange}
                      error={formik.touched.reference && Boolean(formik.errors.reference)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomDatePicker
                      name='date'
                      label={labels.date}
                      value={formik.values?.date}
                      required
                      readOnly={isPosted || isClosed || isOpenOutwards}
                      onChange={formik.setFieldValue}
                      onClear={() => formik.setFieldValue('date', '')}
                      error={formik.touched.date && Boolean(formik.errors.date)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ResourceLookup
                      endpointId={RemittanceOutwardsRepository.OutwardsTransfer.snapshot}
                      valueField='reference'
                      displayField='reference'
                      name='owt_reference'
                      secondDisplayField={false}
                      required
                      label={labels.outwards}
                      form={formik}
                      readOnly={isPosted || isClosed || isOpenOutwards}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Ref.' },
                        { key: 'amount', value: 'Amount' },
                        { key: 'commission', value: 'Commission' },
                        { key: 'corName', value: 'Correspondent' },
                        { key: 'clientName', value: 'Client Name' },
                        { key: 'currencyRef', value: 'Currency Ref.' }
                      ]}
                      displayFieldWidth={4}
                      onChange={async (event, newValue) => {
                        formik.setFieldValue('owt_Id', newValue ? newValue.recordId : '')
                        formik.setFieldValue('owt_reference', newValue ? newValue.reference : '')
                        formik.setFieldValue('owt_exRate', newValue ? newValue.exRate : '')
                        formik.setFieldValue('owt_rateCalcMethod', newValue ? newValue.rateCalcMethod : '')
                        formik.setFieldValue('owt_lcAmount', newValue ? newValue.lcAmount : '')
                        formik.setFieldValue('clientId', newValue ? newValue.clientId : '')
                        formik.setFieldValue('clientName', newValue ? newValue.clientName : '')
                        formik.setFieldValue('clientRef', newValue ? newValue.clientRef : '')
                        formik.setFieldValue('currencyId', newValue ? newValue.currencyId : '')
                        formik.setFieldValue('currencyName', newValue ? newValue.currencyName : '')
                        formik.setFieldValue('currencyRef', newValue ? newValue.currencyRef : '')
                        formik.setFieldValue('fcAmount', newValue ? newValue.fcAmount : '')
                        formik.setFieldValue('corId', newValue ? newValue.corId : '')
                        formik.setFieldValue('corName', newValue ? newValue.corName : '')
                        formik.setFieldValue('corRef', newValue ? newValue.corRef : '')
                        formik.setFieldValue('corReplyStatus', newValue ? newValue.corReplyStatus : '')
                        formik.setFieldValue('cashAccountId', newValue ? newValue.cashAccountId : '')
                        formik.setFieldValue('cashAccountName', newValue ? newValue.cashAccountName : '')
                        formik.setFieldValue('cashAccountRef', newValue ? newValue.cashAccountRef : '')
                        formik.setFieldValue('dispersalType', newValue ? newValue.dispersalType : '')
                        formik.setFieldValue('dispersalName', newValue ? newValue.dispersalName : '')
                        formik.setFieldValue('corRateCalcMethod', newValue ? newValue.corRateCalcMethod : '')
                        formik.setFieldValue('corExRate', newValue ? newValue.corExRate : '')
                        formik.setFieldValue('commission', newValue ? newValue.commission : '')
                        formik.setFieldValue('vatAmount', newValue ? newValue.vatAmount : '')
                        formik.setFieldValue('tdAmount', newValue ? newValue.tdAmount : '')
                        formik.setFieldValue('amount', newValue ? newValue.amount : '')
                        formik.setFieldValue('releaseStatus', newValue ? newValue.releaseStatus : '')
                        formik.setFieldValue('corCurrencyId', newValue ? newValue.corCurrencyId : '')
                        formik.setFieldValue('productId', newValue ? newValue.productId : '')
                        formik.setFieldValue('productName', newValue ? newValue.productName : '')
                        formik.setFieldValue('rateTypeId', newValue ? newValue.rateTypeId : '')
                        formik.setFieldValue('owt_Id', newValue?.recordId || '')
                        const raCurrencyId = await getRaCurrencyId()

                        const [res, data] = await Promise.all([
                          newValue?.corId
                            ? getRequest({
                                extension: RemittanceSettingsRepository.Correspondent.get,
                                parameters: `_recordId=${newValue?.corId}`
                              })
                            : Promise.resolve({ record: {} }),
                          getData(formik.values?.plantId, newValue?.currencyId, newValue?.rateTypeId, raCurrencyId)
                        ])

                        formik.setFieldValue('interfaceId', res?.record?.interfaceId)
                        const fcAmount = parseFloat(newValue?.fcAmount || 0)
                        const owtLcAmount = parseFloat(newValue?.lcAmount || 0)
                        const adRateCalcMethod = parseInt(newValue?.rateCalcMethod, 10)
                        const derivedLcAmount = calculateLcAmount(fcAmount, data?.rate, adRateCalcMethod)

                        const smallestLcAmount = Math.min(owtLcAmount, derivedLcAmount)

                        if (!formik.values.originalLcAmount) {
                          formik.setFieldValue('originalLcAmount', smallestLcAmount)
                        }

                        formik.setFieldValue('derivedLcAmount', derivedLcAmount)
                        formik.setFieldValue('exRate', Math.min(parseFloat(newValue?.exRate || 0), data?.rate || 0))
                        formik.setFieldValue(
                          'rateCalcMethod',
                          Math.min(parseInt(newValue?.rateCalcMethod, 10) || 0, adRateCalcMethod)
                        )

                        formik.setFieldValue('ad_exRate', data?.rate)
                        formik.setFieldValue('ad_rateCalcMethod', data?.rateCalcMethod)
                      }}
                      error={formik.touched.owt_reference && Boolean(formik.errors.owt_reference)}
                      maxAccess={maxAccess}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={SystemRepository.Currency.qry}
                      name='currencyId'
                      label={labels.currency}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      maxAccess={maxAccess}
                      values={formik.values}
                      error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                      readOnly={editMode}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='fcAmount'
                      label={labels.fcAmount}
                      value={formik?.values?.fcAmount}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('fcAmount', '')}
                      error={formik.touched.fcAmount && Boolean(formik.errors.fcAmount)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='owt_lcAmount'
                      label={labels.lcAmount}
                      value={formik?.values?.owt_lcAmount}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('owt_lcAmount', '')}
                      error={formik.touched.owt_lcAmount && Boolean(formik.errors.owt_lcAmount)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='dispersalName'
                      label={labels.dispersalName}
                      value={formik?.values?.dispersalName}
                      onChange={formik.handleChange}
                      error={formik.touched.dispersalName && Boolean(formik.errors.dispersalName)}
                      maxAccess={maxAccess}
                      readOnly
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ResourceLookup
                      readOnly
                      valueField='reference'
                      displayField='name'
                      name='clientId'
                      label={labels.client}
                      form={formik}
                      required
                      displayFieldWidth={2}
                      valueShow='clientRef'
                      secondValueShow='clientName'
                      maxAccess={maxAccess}
                      error={formik.touched.clientId && Boolean(formik.errors.clientId)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='owt_exRate'
                      label={labels.exRate}
                      value={formik?.values?.owt_exRate}
                      required
                      readOnly
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='productName'
                      label={labels.product}
                      value={formik?.values?.productName}
                      onChange={formik.handleChange}
                      error={formik.touched.productName && Boolean(formik.errors.productName)}
                      maxAccess={maxAccess}
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='commission'
                      label={labels.commission}
                      value={formik?.values?.commission}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      error={formik.touched.commission && Boolean(formik.errors.commission)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='vatAmount'
                      label={labels.vatAmount}
                      value={formik?.values?.vatAmount}
                      readOnly
                      required
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('vatAmount', '')}
                      error={formik.touched.vatAmount && Boolean(formik.errors.vatAmount)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceLookup
                      valueField='reference'
                      displayField='name'
                      name='corId'
                      label={labels.correspondent}
                      form={formik}
                      required
                      valueShow='corRef'
                      secondValueShow='corName'
                      readOnly
                      maxAccess={maxAccess}
                      error={formik.touched.corId && Boolean(formik.errors.corId)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='tdAmount'
                      label={labels.tdAmount}
                      value={formik?.values?.tdAmount}
                      readOnly
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('tdAmount', '')}
                      error={formik.touched.tdAmount && Boolean(formik.errors.tdAmount)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomCheckBox
                      name='otpVerified'
                      value={formik.values?.otpVerified}
                      onChange={event => formik.setFieldValue('otpVerified', event.target.checked)}
                      label={labels.otpVerified}
                      disabled={true}
                      maxAccess={access}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='amount'
                      label={labels.amount}
                      value={formik?.values?.amount}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('amount', '')}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                    />
                  </Grid>
                </FieldSet>
              </Grid>
              <Grid item xs={6}>
                <FieldSet title='Calculated'>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      datasetId={DataSets.REQUESTED_BY}
                      name='requestedBy'
                      label={labels.requestedBy}
                      valueField='key'
                      displayField='value'
                      values={formik.values}
                      required
                      readOnly={isPosted || isClosed || isOpenOutwards}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        const originalLcAmount = formik.values.originalLcAmount

                        formik.setFieldValue('requestedBy', newValue?.key)

                        if (newValue?.key === '1') {
                          formik.setFieldValue('lcAmount', formik?.values?.amount)
                          getExRateChangeStatus(formik?.values?.amount, formik?.values?.amount)
                        } else if (newValue?.key === '3') {
                          formik.setFieldValue('lcAmount', originalLcAmount)
                          getExRateChangeStatus(formik?.values?.amount, originalLcAmount)
                        }
                      }}
                      error={formik.touched.requestedBy && Boolean(formik.errors.requestedBy)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      datasetId={DataSets.SETTLEMENT_STATUS}
                      name='settlementStatus'
                      label={labels.settlementStatus}
                      valueField='key'
                      displayField='value'
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('settlementStatus', newValue?.key)
                      }}
                      defaultIndex={formik?.values?.interfaceId && 0}
                      required
                      readOnly={
                        !recordId ||
                        (isOpenOutwards && !!formik.values.interfaceId) ||
                        (!isOpenOutwards && (isPosted || isClosed || !!formik.values.interfaceId))
                      }
                      maxAccess={maxAccess}
                      error={formik.touched.settlementStatus && Boolean(formik.errors.settlementStatus)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='ad_exRate'
                      label={labels.exRate}
                      value={formik?.values?.ad_exRate}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('ad_exRate', '')}
                      error={formik.touched.ad_exRate && Boolean(formik.errors.ad_exRate)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='derivedLcAmount'
                      label={labels.amount}
                      value={formik?.values?.derivedLcAmount}
                      required
                      readOnly
                    />
                  </Grid>
                </FieldSet>
                <FieldSet title='Amount'>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='lcAmount'
                      label={labels.lcAmount}
                      value={formik?.values?.lcAmount}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('lcAmount', '')}
                      error={formik.touched.lcAmount && Boolean(formik.errors.lcAmount)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      datasetId={DataSets.EXCHANGE_RATE_CHANGE_STATUS}
                      name='exRateChangeStatus'
                      label={labels.exRateChangeStatus}
                      valueField='key'
                      displayField='value'
                      values={formik.values}
                      required
                      readOnly
                      maxAccess={maxAccess}
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
