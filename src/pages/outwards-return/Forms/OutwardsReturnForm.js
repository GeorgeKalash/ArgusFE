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
  const { platformLabels } = useContext(ControlContext)
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
    try {
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsReturn.get,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      dtId: dtId || null,
      reference: '',
      owId: '',
      outwardRef: '',
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
      plantId: plantId,
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
      settlementStatus: null,
      interfaceId: null,
      attemptNo: 1
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      owtId: yup.number().required(),
      outwardRef: yup.string().required(),
      requestedBy: yup.string().required(),
      currencyId: yup.string().required(),
      clientId: yup.number().required(),
      corId: yup.number().required(),
      fcAmount: yup.string().required(),
      dispersalName: yup.string().required(),
      vatAmount: yup.string().required(),
      settlementStatus: yup.number().required(),
      lcAmount: yup.string().required(),
      exRate: yup.string().required(),
      commission: yup.string().required(),
      amount: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
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
            date: formatDateFromApi(res2.record.date)
          })
          !recordId && viewOTP(response.recordId)
          if (isOpenOutwards) {
            refetch()
          }
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })

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
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsReturn.close,
        record: JSON.stringify({
          recordId: formik.values.recordId ?? recId
        })
      })

      if (res.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        const res2 = await getOutwardsReturn(res.recordId)

        formik.setValues({
          ...res2.record,
          date: formatDateFromApi(res2.record.date)
        })
      }
    } catch (error) {}
  }

  const onReopen = async () => {
    try {
      const copy = { ...formik.values }
      copy.date = formatDateToApi(copy.date)

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsReturn.reopen,
        record: JSON.stringify(copy)
      })

      if (res.recordId) {
        toast.success(platformLabels.Reopened)
        invalidate()

        const res2 = await getOutwardsReturn(res.recordId)

        formik.setValues({
          ...res2.record,
          date: formatDateFromApi(res2.record.date)
        })
      }
    } catch (error) {}
  }
  const isPosted = formik.values.status === 3

  const onPost = async () => {
    try {
      const copy = { ...formik.values }
      copy.date = formatDateToApi(copy.date)

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.OutwardsReturn.post,
        record: JSON.stringify(copy)
      })

      if (res.recordId) {
        toast.success(platformLabels.Posted)
        invalidate()

        const res2 = await getOutwardsReturn(res.recordId)

        formik.setValues({
          ...res2.record,
          date: formatDateFromApi(res2.record.date)
        })
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

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getOutwardsReturn(recordId)

          formik.setValues({
            ...res.record,
            date: formatDateFromApi(res.record.date)
          })
        }
      } catch (exception) {}
    })()
  }, [])

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
          <Grid container spacing={4}>
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
                name='outwardRef'
                secondDisplayField={false}
                required
                label={labels.outwards}
                form={formik}
                readOnly={isPosted || isClosed || isOpenOutwards}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('owtId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('outwardRef', newValue ? newValue.reference : '')
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
                  formik.setFieldValue('exRate', newValue ? newValue.exRate : '')
                  formik.setFieldValue('rateCalcMethod', newValue ? newValue.rateCalcMethod : '')
                  formik.setFieldValue('lcAmount', newValue ? newValue.lcAmount : '')
                  formik.setFieldValue('releaseStatus', newValue ? newValue.releaseStatus : '')
                  formik.setFieldValue('corCurrencyId', newValue ? newValue.corCurrencyId : '')
                  formik.setFieldValue('productId', newValue ? newValue.productId : '')
                  formik.setFieldValue('productName', newValue ? newValue.productName : '')
                  if (newValue?.corId) {
                    const res = await getRequest({
                      extension: RemittanceSettingsRepository.Correspondent.get,
                      parameters: `_recordId=${newValue?.corId}`
                    })
                    formik.setFieldValue('interfaceId', res?.record?.interfaceId)
                  }
                }}
                error={formik.touched.outwardRef && Boolean(formik.errors.outwardRef)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
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
                  formik.setFieldValue('requestedBy', newValue?.key)
                }}
                error={formik.touched.requestedBy && Boolean(formik.errors.requestedBy)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                readOnly
                required
                maxAccess={maxAccess}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
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
                name='exRate'
                label={labels.exRate}
                value={formik?.values?.exRate}
                required
                readOnly
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('exRate', '')}
                error={formik.touched.exRate && Boolean(formik.errors.exRate)}
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
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('commission', '')}
                error={formik.touched.commission && Boolean(formik.errors.commission)}
              />
            </Grid>
            <Grid item xs={6}>
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
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.SETTLEMENT_STATUS}
                name='settlementStatus'
                label={labels.settlementStatus}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('settlementStatus', newValue ? newValue?.key : '')
                }}
                defaultIndex={formik?.values?.interfaceId ? 0 : null}
                required
                readOnly={
                  isOpenOutwards ? !!formik.values.interfaceId : isPosted || isClosed || !!formik.values.interfaceId
                }
                maxAccess={maxAccess}
                error={formik.touched.settlementStatus && Boolean(formik.errors.settlementStatus)}
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
              <FormControlLabel
                control={
                  <Checkbox
                    name='otpVerified'
                    checked={formik.values?.otpVerified}
                    disabled={true}
                    onChange={formik.handleChange}
                    maxAccess={access}
                  />
                }
                label={labels.otpVerified}
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
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
