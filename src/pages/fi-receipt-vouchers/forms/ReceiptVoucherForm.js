import { Button, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { SystemFunction } from 'src/resources/SystemFunction'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { DataSets } from 'src/resources/DataSets'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { RateDivision } from 'src/resources/RateDivision'
import { useWindow } from 'src/windows'
import MultiCurrencyRateForm from 'src/components/Shared/MultiCurrencyRateForm'
import { DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import AccountSummary from 'src/components/Shared/AccountSummary'

export default function ReceiptVoucherForm({ labels, maxAccess: access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ReceiptVoucher,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.ReceiptVouchers.page
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const currencyId = parseInt(defaultsData?.list?.find(obj => obj.key === 'currencyId')?.value)
  const defaultAccountId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  const { formik } = useForm({
    maxAccess: maxAccess,
    validateOnChange: true,
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId,
      reference: '',
      accountId: null,
      date: new Date(),
      currencyId,
      currencyName: '',
      dtId: null,
      sptId: null,
      dgId: '',
      amount: '',
      baseAmount: '',
      checkNo: null,
      notes: '',
      oDocId: '',
      printStatus: '',
      status: 1,
      paymentMethod: '1',
      cashAccountId: null,
      plantId: plantId,
      exRate: 1.0,
      rateCalcMethod: 1,
      contactId: null,
      collectorId: null,
      isVerified: false,
      template: 1,
      sourceReference: ''
    },
    validationSchema: yup.object({
      accountId: yup.string().required(),
      currencyId: yup.string().required(),
      cashAccountId: yup.string().required(),
      date: yup.date().required(),
      amount: yup.string().required(),
      paymentMethod: yup.string().required(),
      checkNo: yup
        .string()
        .nullable()
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
        )
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: FinancialRepository.ReceiptVouchers.set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      })
      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)
      await getData(response.recordId)
      invalidate()
    }
  })

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

  async function getDTD(dtId) {
    if (dtId) {
      const { record } = await getRequest({
        extension: FinancialRepository.FIDocTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })
      formik.setFieldValue('plantId', record?.plantId || plantId)
      getCashAccount(record?.cashAccountId || defaultAccountId)
    }
  }

  useEffect(() => {
    if (formik.values.dtId && !recordId) getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  async function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        DatasetIdAccess: ResourceIds.MCRFIReceiptVoucher,
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

  const editMode = !!formik.values.recordId
  const isCancelled = formik.values.status === -1
  const isPosted = formik.values.status === 3
  const isVerified = formik.values.isVerified

  const getCashAccount = async cashAccountId => {
    if (!cashAccountId) {
      formik.setFieldValue('cashAccountId', null)
      formik.setFieldValue('cashAccountRef', '')
      formik.setFieldValue('cashAccountName', '')

      return
    }

    const { record: cashAccountResult } = await getRequest({
      extension: CashBankRepository.CbBankAccounts.get,
      parameters: `_recordId=${cashAccountId}`
    })

    formik.setFieldValue('cashAccountId', cashAccountResult?.recordId)
    formik.setFieldValue('cashAccountRef', cashAccountResult?.reference)
    formik.setFieldValue('cashAccountName', cashAccountResult?.name)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await getData(recordId)
      else getCashAccount(defaultAccountId)
    })()
  }, [])

  async function getData(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: FinancialRepository.ReceiptVouchers.get,
        parameters: `_recordId=${recordId}`
      })
      formik.setValues({ ...res.record, date: formatDateFromApi(res.record.date) })
    }
  }

  const onCancel = async () => {
    const obj = formik.values

    const res = await postRequest({
      extension: FinancialRepository.ReceiptVouchers.cancel,
      record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
    })

    if (res?.recordId) {
      await getData(res?.recordId)
      toast.success(platformLabels.Cancelled)
      invalidate()
    }
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.ReceiptVouchers.unpost,
      record: JSON.stringify(formik.values)
    })

    if (res) {
      toast.success(platformLabels.Unposted)
      invalidate()
      await getData(formik.values.recordId)
    }
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.ReceiptVouchers.post,
      record: JSON.stringify(formik.values)
    })

    if (res) {
      toast.success(platformLabels.Posted)
      invalidate()
      await getData(formik.values.recordId)
      window.close()
    }
  }

  const onVerify = async () => {
    const res = await postRequest({
      extension: FinancialRepository.ReceiptVouchers.verify,
      record: JSON.stringify(formik.values)
    })

    if (res) {
      toast.success(!isVerified ? platformLabels.Verified : platformLabels.Unverfied)
      invalidate()
      window.close()
    }
  }

  const onReset = async () => {
    await postRequest({
      extension: FinancialRepository.ResetGL_RV.reset,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values.date) })
    })
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLReceiptVoucher,
      onReset,
      disabled: !editMode
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
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
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
      resourceId={ResourceIds.ReceiptVoucher}
      functionId={SystemFunction.ReceiptVoucher}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isPosted || isCancelled}
      previewReport={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.ReceiptVoucher}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
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
                onChange={async (e, newValue) => {
                  formik.setFieldValue('date', newValue)
                  await getMultiCurrencyFormData(formik.values.currencyId, newValue, RateDivision.FINANCIALS)
                }}
                autoFocus={!editMode}
                readOnly={isCancelled || isPosted}
                value={formik.values.date}
                maxAccess={maxAccess}
                required
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                maxAccess={!editMode && maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                readOnly={isCancelled || isPosted}
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                required
                name='accountId'
                firstFieldWidth={4}
                readOnly={isCancelled || isPosted}
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
                displayFieldWidth={4}
                filter={{ isInactive: val => val !== true }}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue ? newValue.recordId : null)
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                  formik.setFieldValue('spId', newValue?.spId || '')
                  formik.setFieldValue('sptId', newValue?.sptId || '')
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
                endpointId={SaleRepository.SalesPerson.qry}
                name='spId'
                readOnly={!formik.values.accountId || isCancelled || isPosted}
                label={labels.salePerson}
                valueField='recordId'
                displayField={['spRef', 'name']}
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue?.recordId)
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                readOnly={isCancelled || isPosted}
                label={labels.receiptMethod}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('cashAccountId', null)
                  formik.setFieldValue('cashAccountRef', null)
                  formik.setFieldValue('cashAccountName', null)
                  formik.setFieldValue('checkNo', null)
                  formik.setFieldValue('paymentMethod', newValue?.key || null)
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='checkNo'
                label={labels.checkNo}
                value={formik.values.checkNo}
                maxAccess={maxAccess}
                maxLength={30}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('checkNo', null)}
                error={formik.touched.checkNo && Boolean(formik.errors.checkNo)}
                readOnly={formik.values.paymentMethod != 3}
                required={formik.values.paymentMethod == 3}
              />
            </Grid>

            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=${formik.values.paymentMethod == 2 ? 1 : 0}`}
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
              <ResourceComboBox
                endpointId={formik.values?.accountId && FinancialRepository.Contact.qry}
                parameters={formik.values?.accountId && `_accountId=${formik.values?.accountId}`}
                name='contactId'
                readOnly={isCancelled || isPosted}
                label={labels.contact}
                valueField='recordId'
                displayField={['reference', 'name']}
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
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs={8}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    readOnly={isCancelled || isPosted}
                    required
                    filter={item => item.currencyType === 1}
                    label={labels.currency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={async (event, newValue) => {
                      await getMultiCurrencyFormData(newValue?.recordId, formik.values.date, RateDivision.FINANCIALS)
                      formik.setFieldValue('currencyId', newValue?.recordId)
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
              <CustomTextField
                name='sourceReference'
                label={labels.sourceReference}
                value={formik.values.sourceReference}
                readOnly={isCancelled || isPosted}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('sourceReference', '')}
                maxLength='20'
                maxAccess={maxAccess}
                error={formik.touched.sourceReference && Boolean(formik.errors.sourceReference)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={LogisticsRepository.LoCollector.qry}
                name='collectorId'
                readOnly={isCancelled || isPosted}
                label={labels.collector}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('collectorId', newValue?.recordId || '')
                }}
                error={formik.touched.collectorId && Boolean(formik.errors.collectorId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='amount'
                required
                label={labels.amount}
                value={formik.values.amount}
                readOnly={isCancelled || isPosted}
                maxAccess={maxAccess}
                maxLength={'10'}
                decimalScale={2}
                onChange={async e => {
                  formik.setFieldValue('amount', e.target.value)

                  const updatedRateRow = getRate({
                    amount: e.target.value ?? 0,
                    exRate: formik.values?.exRate,
                    baseAmount: 0,
                    rateCalcMethod: formik.values?.rateCalcMethod,
                    dirtyField: DIRTYFIELD_RATE
                  })
                  formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
                }}
                onClear={async () => {
                  formik.setFieldValue('amount', 0)
                }}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                neverPopulate
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='templateId'
                label={labels.descriptionTemplate}
                readOnly={isCancelled || isPosted}
                valueField='recordId'
                displayField='name'
                onChange={(event, newValue) => {
                  let notes = formik.values.notes

                  if (newValue?.name) formik.setFieldValue('notes', notes + newValue?.name + '\n')
                }}
                error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                type='text'
                label={labels.notes}
                value={formik.values.notes}
                readOnly={isCancelled || isPosted}
                rows={3}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
