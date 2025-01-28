import { Button, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
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

export default function FiPaymentVouchersForm({ labels, maxAccess: access, recordId, plantId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PaymentVoucher,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentVouchers.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      accountId: '',
      accountType: '',
      currencyId: null,
      currencyName: '',
      paymentMethod: '',
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
      cashAccountId: null,
      dtId: documentType?.dtId,
      status: 1,
      releaseStatus: null,
      plantId: parseInt(plantId),
      contactId: null,
      isVerified: false,
      sourceReference: ''
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      accountType: yup.string().required(),
      currencyId: yup.number().required(),
      date: yup.string().required(),
      paymentMethod: yup.string().required(),
      cashAccountId: yup.string().required(),
      amount: yup.string().required()
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

  const { labels: _labels, access: MRCMaxAccess } = useResourceQuery({
    endpointId: MultiCurrencyRepository.Currency.get,
    datasetId: ResourceIds.MultiCurrencyRate
  })

  async function getMultiCurrencyFormData(currencyId, date, rateType, amount) {
    if (currencyId && date && rateType) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${date}&_rateDivision=${rateType}`
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
        labels: _labels,
        maxAccess: MRCMaxAccess,
        data,
        onOk: childFormikValues => {
          formik.setValues(prevValues => ({
            ...prevValues,
            ...childFormikValues
          }))
        }
      },
      width: 500,
      height: 500,
      title: _labels.MultiCurrencyRate
    })
  }

  const isPosted = formik.values.status === 3
  const isCancelled = formik.values.status === -1
  const editMode = !!formik.values.recordId

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
      }
      getDefaultsData()
    })()
  }, [])

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PaymentVoucher,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
    })
  }

  const onCancel = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentVouchers.cancel,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success('Record Cancelled Successfully')
      invalidate()
      const res2 = await getPaymentVouchers(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      formik.setValues(res2.record)
    }
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode || isCancelled
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isCancelled
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
    }
  ]

  async function getDefaultsData() {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return obj.key === 'currencyId'
    })

    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setDefaultsDataState(myObject)

    return myObject
  }

  useEffect(() => {
    if (!editMode) formik.setFieldValue('currencyId', parseInt(defaultsDataState?.currencyId))
  }, [defaultsDataState])

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
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.PaymentVoucher}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={isPosted || isCancelled}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
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
                  await getMultiCurrencyFormData(
                    formik.values.currencyId,
                    formatDateForGetApI(newValue),
                    RateDivision.FINANCIALS
                  )
                }}
                onClear={() => formik.setFieldValue('date', '')}
                readOnly={isPosted || isCancelled}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={isPosted || isCancelled}
                maxAccess={maxAccess}
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
                  formik.setFieldValue('accountType', newValue?.key)
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
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                readOnly={isPosted || isCancelled}
                label={labels.accountReference}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                form={formik}
                filter={{ type: formik.values.accountType }}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                name='cashAccountRef'
                readOnly={isPosted || isCancelled}
                label={labels.cash}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                required
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    cashAccountId: newValue?.recordId || '',
                    cashAccountRef: newValue?.reference || '',
                    cashAccountName: newValue?.name || ''
                  })
                }}
                errorCheck={'cashAccountId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs={8}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={labels.currency}
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
                      await getMultiCurrencyFormData(
                        newValue?.recordId,
                        formatDateForGetApI(formik.values.date),
                        RateDivision.FINANCIALS
                      )
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
                    disabled={formik.values.currencyId === defaultsDataState?.currencyId}
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
                  formik.setFieldValue('paymentMethod', newValue?.key)
                  formik.setFieldValue('checkNo', '')
                  formik.setFieldValue('checkbookId', null)
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='amount'
                type='text'
                required
                label={labels.amount}
                maxLength={'10'}
                decimalScale={2}
                readOnly={isPosted || isCancelled}
                value={formik.values.amount}
                maxAccess={maxAccess}
                thousandSeparator={false}
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
              <CustomTextField
                name='sourceReference'
                label={labels.sourceReference}
                value={formik.values.sourceReference}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('sourceReference', '')}
                maxLength='20'
                maxAccess={maxAccess}
                error={formik.touched.sourceReference && Boolean(formik.errors.sourceReference)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
