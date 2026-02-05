import { Button, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
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
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DataSets } from 'src/resources/DataSets'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import MultiCurrencyRateForm from 'src/components/Shared/MultiCurrencyRateForm'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import { RateDivision } from 'src/resources/RateDivision'
import AccountSummary from 'src/components/Shared/AccountSummary'
import useResourceParams from 'src/hooks/useResourceParams'
import useSetWindow from 'src/hooks/useSetWindow'

export default function FiPaymentVouchersForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PaymentVouchers,
    editMode: !!recordId
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PaymentVoucher,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentVouchers.page3
  })

  useSetWindow({ title: labels.paymentVoucher, window })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const currencyId = parseInt(defaultsData?.list?.find(obj => obj.key === 'currencyId')?.value)
  const cashAccountId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      reference: '',
      accountId: '',
      accountType: '',
      currencyId: parseInt(currencyId),
      currencyName: '',
      paymentMethod: null,
      date: new Date(),
      glId: null,
      amount: null,
      checkNo: '',
      checkbookId: null,
      decimals: null,
      notes: '',
      exRate: 1,
      rateCalcMethod: 1,
      baseAmount: null,
      cashAccountId: parseInt(cashAccountId),
      dtId: null,
      status: 1,
      releaseStatus: null,
      plantId: parseInt(plantId),
      contactId: null,
      isVerified: false,
      sourceReference: '',
      paymentReasonId: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      accountType: yup.string().required(),
      currencyId: yup.number().required(),
      date: yup.string().required(),
      paymentMethod: yup.string().required(),
      cashAccountId: yup.string().required(),
      checkNo: yup
        .string()
        .test(
          'check-no-required-if-payment-method-3',
          'Check number is required when payment method is 3.',
          function (value) {
            const { paymentMethod } = this.parent
            if (paymentMethod == 3) {
              return value && value.trim() !== ''
            }

            return true
          }
        ),
      amount: yup.number().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const data = {
        header: {
          ...obj,
          date: formatDateToApi(obj.date),
          recordId: recordId
        },
        items: [],
        costCenters: []
      }

      const response = await postRequest({
        extension: FinancialRepository.PaymentVouchers.set2,
        record: JSON.stringify(data)
      })

      !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
      const res2 = await getPaymentVouchers(response.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      formik.setValues(res2.record)

      invalidate()
    }
  })

  const getCashAccountAndPayment = async cashAccountId => {
    if (cashAccountId) {
      const { record: cashAccountResult } = await getRequest({
        extension: CashBankRepository.CbBankAccounts.get,
        parameters: `_recordId=${cashAccountId}`
      })
      formik.setFieldValue('cashAccountId', cashAccountResult?.recordId)
      formik.setFieldValue('cashAccountRef', cashAccountResult.reference)
      formik.setFieldValue('cashAccountName', cashAccountResult.name)

      return cashAccountResult.paymentMethod
    } else {
      return null
    }
  }

  async function getMultiCurrencyFormData(currencyId, date, rateType, amount) {
    if (currencyId && date && rateType) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${rateType}`
      })

      const updatedRateRow = getRate({
        amount: amount === 0 ? 0 : amount ?? formik.values.amount,
        exRate: res.record?.exRate,
        baseAmount: 0,
        rateCalcMethod: res.record?.rateCalcMethod,
        dirtyField: DIRTYFIELD_RATE
      })

      formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
      formik.setFieldValue('exRate', res.record?.exRate)
      formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod)
    }
  }

  function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        DatasetIdAccess: ResourceIds.MCRFIPaymentVoucher,
        data,
        onOk: childFormikValues => {
          formik.setValues(prevValues => ({
            ...prevValues,
            ...childFormikValues
          }))
        }
      }
    })
  }

  const isPosted = formik.values.status === 3
  const isCancelled = formik.values.status === -1
  const editMode = !!formik.values.recordId
  const isVerified = formik.values.isVerified

  async function getPaymentVouchers(recordId) {
    return await getRequest({
      extension: FinancialRepository.PaymentVouchers.get,
      parameters: `_recordId=${recordId}`
    })
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentVouchers.post,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      formik.setValues(res2.record)
    }
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentVouchers.unpost,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Unposted)
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      formik.setValues(res2.record)
    }
  }

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: FinancialRepository.FIDocTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('plantId', res?.record?.plantId || plantId)
      const payment = await getCashAccountAndPayment(res?.record?.cashAccountId || cashAccountId)
      formik.setFieldValue('paymentMethod', res?.record?.paymentMethod || payment)
    }
  }

  useEffect(() => {
    if (formik.values?.dtId && !recordId) getDTD(formik.values?.dtId)
  }, [formik.values?.dtId])

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.PaymentVouchers.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date)
        })
      } else {
        getCashAccountAndPayment(cashAccountId)
      }
    })()
  }, [])

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PaymentVoucher,
        recordId: formik.values.recordId
      }
    })
  }

  const onCancel = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentVouchers.cancel,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Cancelled)
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      formik.setValues(res2.record)
    }
  }

  const onVerify = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentVouchers.verify,
      record: JSON.stringify(formik.values)
    })

    if (res) {
      toast.success(!isVerified ? platformLabels.Verified : platformLabels.Unverfied)
      invalidate()
      window.close()
    }
  }

  const onReset = async () => {
    const payload = {
      header: {
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        recordId: formik.values.recordId
      },
      items: [],
      costCenters: []
    }
    await postRequest({
      extension: FinancialRepository.ResetGL_PV.reset,
      record: JSON.stringify(payload)
    })
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode || isCancelled || isVerified
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isCancelled
    },
    {
      key: 'Verify',
      condition: !isVerified,
      onClick: onVerify,
      disabled: !isPosted
    },
    {
      key: 'Unverify',
      condition: isVerified,
      onClick: onVerify,
      disabled: !isPosted
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isPosted || isCancelled
    },
    {
      key: 'FI Trx',
      condition: true,
      onClick: 'onClickIT',
      disabled: !editMode
    },
    {
      key: 'Aging',
      condition: true,
      onClick: 'onClickAging',
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLPaymentVouchers,
      onReset,
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: {
            accountId: parseInt(formik.values.accountId),
            date: formik.values.date
          }
        })
      },
      disabled: !formik.values.accountId
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.PaymentVouchers}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      functionId={SystemFunction.PaymentVoucher}
      disabledSubmit={isPosted || isCancelled}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.PaymentVoucher}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                required
                onChange={async (e, newValue) => {
                  formik.setFieldValue('date', newValue)
                  await getMultiCurrencyFormData(formik.values.currencyId, newValue, RateDivision.FINANCIALS)
                }}
                onClear={() => formik.setFieldValue('date', null)}
                readOnly={isPosted || isCancelled}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                maxAccess={!editMode && maxAccess}
                maxLength='15'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                readOnly={isPosted || isCancelled}
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.FI_PV_GROUP_TYPE}
                name='accountType'
                filter={item => item.key == 1 || item.key == 4}
                label={labels.accountType}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={isPosted || isCancelled}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountType', newValue?.key || null)
                  if (!newValue?.key) {
                    formik.setFieldValue('accountId', null)
                    formik.setFieldValue('accountRef', '')
                    formik.setFieldValue('accountName', '')
                  }
                }}
                error={formik.touched.accountType && Boolean(formik.errors.accountType)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={formik.values?.accountId && FinancialRepository.Contact.qry}
                parameters={formik.values?.accountId && `_accountId=${formik.values?.accountId}`}
                name='contactId'
                readOnly={isPosted || isCancelled}
                label={labels.contact}
                valueField='recordId'
                displayField={'name'}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('contactId', newValue?.recordId || null)
                }}
                error={formik.touched.contactId && Boolean(formik.errors.contactId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                readOnly={isPosted || isCancelled || !formik.values.accountType}
                label={labels.accountReference}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                form={formik}
                columnsInDropDown={[
                  { key: 'reference', value: 'Account Ref' },
                  { key: 'name', value: 'Name', grid: 4 },
                  { key: 'keywords', value: 'Keywords' }
                ]}
                firstFieldWidth={4}
                displayFieldWidth={4}
                filter={{ type: formik.values.accountType, isInactive: val => val !== true }}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                  formik.setFieldValue('accountGroupName', newValue?.groupName || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='accountGroupName'
                label={labels.accountGroup}
                value={formik.values.accountGroupName}
                readOnly
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0`}
                name='cashAccountId'
                readOnly={isCancelled || isPosted}
                required
                label={labels.cashAccount}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
              />
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs={8}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={labels.currency}
                    filter={item => item.currencyType === 1}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    readOnly={isPosted || isCancelled}
                    values={formik.values}
                    onChange={async (event, newValue) => {
                      await getMultiCurrencyFormData(newValue?.recordId, formik.values.date, RateDivision.FINANCIALS)
                      formik.setFieldValue('currencyId', newValue ? newValue?.recordId : null)
                      formik.setFieldValue('currencyName', newValue?.name)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => openMCRForm(formik.values)}
                    disabled={!formik.values.currencyId || formik.values.currencyId === currencyId}
                  >
                    <img src='/images/buttonsIcons/popup.png' alt={platformLabels.add} />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                label={labels.paymentMethod}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={isPosted || isCancelled}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('paymentMethod', newValue?.key || null)
                  if (!newValue?.key) {
                    formik.setFieldValue('checkNo', '')
                    formik.setFieldValue('checkbookId', null)
                  }
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='amount'
                required
                label={labels.amount}
                maxLength={14}
                decimalScale={2}
                readOnly={isPosted || isCancelled}
                value={formik.values.amount}
                maxAccess={maxAccess}
                onChange={async e => {
                  const updatedRateRow = getRate({
                    amount: e.target.value ?? 0,
                    exRate: formik.values?.exRate,
                    baseAmount: 0,
                    rateCalcMethod: formik.values?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_RATE
                  })
                  formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
                  formik.setFieldValue('amount', e.target.value)
                }}
                onClear={async () => {
                  formik.setFieldValue('amount', 0)
                }}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='checkNo'
                label={labels.checkNo}
                value={formik.values.checkNo}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('checkNo', '')}
                error={formik.touched.checkNo && Boolean(formik.errors.checkNo)}
                disabled={formik.values.paymentMethod != 3}
                required={formik.values.paymentMethod == 3}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='templateId'
                label={labels.descriptionTemplate}
                readOnly={isPosted || isCancelled}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  let notes = formik.values.notes
                  notes += newValue?.name && formik.values.notes && '\n'
                  notes += newValue?.name

                  notes && formik.setFieldValue('notes', notes)
                  newValue?.name && formik.setFieldValue('templateId', newValue.recordId)
                }}
                error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={CashBankRepository.CACheckbook.qry}
                name='checkbookId'
                label={labels.checkbook}
                valueField='recordId'
                displayField={'firstCheckNo'}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('checkbookId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.checkbookId && Boolean(formik.errors.checkbookId)}
                disabled={formik.values.paymentMethod != 3}
              />
            </Grid>

            <Grid item xs={6}>
              <CustomTextField
                name='sourceReference'
                label={labels.sourceReference}
                value={formik.values.sourceReference}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('sourceReference', '')}
                maxLength='20'
                readOnly={isPosted || isCancelled}
                maxAccess={maxAccess}
                error={formik.touched.sourceReference && Boolean(formik.errors.sourceReference)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextArea
                name='notes'
                type='text'
                label={labels.notes}
                value={formik.values.notes}
                readOnly={isPosted || isCancelled}
                rows={3}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={FinancialRepository.PaymentReasons.qry}
                name='paymentReasonId'
                readOnly={isPosted || isCancelled}
                label={labels.paymentReasons}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('paymentReasonId', newValue?.recordId || null)
                }}
                error={formik.touched.paymentReasonId && Boolean(formik.errors.paymentReasonId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

FiPaymentVouchersForm.width = 1250
FiPaymentVouchersForm.height = 550
