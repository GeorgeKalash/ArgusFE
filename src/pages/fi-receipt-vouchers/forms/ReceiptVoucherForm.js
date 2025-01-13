import { Button, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
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

export default function ReceiptVoucherForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [userDefaultsDataState, setUserDefaultsDataState] = useState(null)
  const [defaultsDataState, setDefaultsDataState] = useState(null)
  const { stack } = useWindow()

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.ReceiptVoucher,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.ReceiptVouchers.page
  })

  const { labels: _labels, access: MRCMaxAccess } = useResourceQuery({
    endpointId: MultiCurrencyRepository.Currency.get,
    datasetId: ResourceIds.MultiCurrencyRate
  })

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      recordId,
      reference: '',
      accountId: null,
      date: new Date(),
      currencyId: null,
      currencyName: '',
      dtId: documentType?.dtId,
      sptId: null,
      dgId: '',
      amount: '',
      baseAmount: '',
      notes: '',
      oDocId: '',
      printStatus: '',
      status: 1,
      paymentMethod: '1',
      cashAccountId: null,
      plantId: null,
      exRate: 1.0,
      rateCalcMethod: 1,
      contactId: null,
      collectorId: null,
      isVerified: true,
      template: 1,
      sourceReference: ''
    },
    validationSchema: yup.object({
      accountId: yup.string().required(),
      currencyId: yup.string().required(),
      cashAccountId: yup.string().required(),
      amount: yup.string().required(),
      paymentMethod: yup.string().required()
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
      invalidate()
    }
  })

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

  async function getUserDefaultsData() {
    const myObject = {}

    const filteredList = userDefaultsData?.list?.filter(obj => {
      return obj.key === 'plantId' || obj.key === 'userId' || obj.key === 'cashAccountId'
    })
    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setUserDefaultsDataState(myObject)

    return myObject
  }

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

  const setDefaultFields = () => {
    formik.setFieldValue('plantId', userDefaultsDataState.plantId)
    formik.setFieldValue('cashAccountId', userDefaultsDataState?.cashAccountId || null)
  }

  useEffect(() => {
    userDefaultsDataState && setDefaultFields()
  }, [userDefaultsDataState])

  const editMode = !!formik.values.recordId
  const isCancelled = formik.values.status === -1
  const isPosted = formik.values.status === 3
  const readOnly = formik.values.status !== 1

  const getCashAccount = async () => {
    const cashAccountId = formik.values.cashAccountId
    if (cashAccountId) {
      const { record: cashAccountResult } = await getRequest({
        extension: CashBankRepository.CbBankAccounts.get,
        parameters: `_recordId=${cashAccountId}`
      })

      formik.setFieldValue('cashAccountId', cashAccountId)
      formik.setFieldValue('cashAccountRef', cashAccountResult.reference)
      formik.setFieldValue('cashAccountName', cashAccountResult.name)
    }
  }

  useEffect(() => {
    if (formik.values.recordId) getCashAccount()
    ;(async function () {
      getData()
      getUserDefaultsData()
      getDefaultsData()
    })()
  }, [])

  async function getData() {
    if (recordId) {
      const res = await getRequest({
        extension: FinancialRepository.ReceiptVouchers.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues({ ...res.record, date: formatDateFromApi(res.record.date) })
    }
  }

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

  const onCancel = async () => {
    const obj = formik.values

    const res = await postRequest({
      extension: FinancialRepository.ReceiptVouchers.cancel,
      record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
    })

    if (res?.recordId) {
      getData()
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
      getData()
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
      getData()
    }
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
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
      disabled: !editMode || isCancelled
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isCancelled
    },
    {
      field: 'isVerified',
      headerName: labels.isVerified,
      type: 'checkbox'
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
          <Grid container spacing={3}>
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
                  formik.setFieldValue('date', newValue.date)
                  await getMultiCurrencyFormData(
                    formik.values.currencyId,
                    formatDateForGetApI(formik.values.date),
                    RateDivision.FINANCIALS
                  )
                }}
                readOnly={readOnly}
                value={formik.values.date}
                maxAccess={maxAccess}
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
                readOnly={readOnly}
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
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                required
                name='accountId'
                readOnly={readOnly}
                label={labels.accountReference}
                valueField='reference'
                displayField='name'
                valueShow='accountRef'
                secondValueShow='accountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue ? newValue.recordId : null)
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                  formik.setFieldValue('spId', newValue?.spId || '')
                  formik.setFieldValue('sptId', newValue?.sptId || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='sptId'
                readOnly={!formik.values.accountId}
                label={labels.salePerson}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sptId', newValue?.recordId)
                }}
                error={formik.touched.sptId && Boolean(formik.errors.sptId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                readOnly={readOnly}
                label={labels.paymentMethod}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('cashAccountRef', newValue?.reference || '')
                  formik.setFieldValue('cashAccountName', newValue ? newValue.name : '')
                  formik.setFieldValue('paymentMethod', newValue?.key || null)
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={formik.values?.accountId && FinancialRepository.Contact.qry}
                parameters={formik.values?.accountId && `_accountId=${formik.values?.accountId}`}
                name='contactId'
                readOnly={readOnly}
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
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                name='cashAccountRef'
                readOnly={readOnly}
                label={labels.cashAccount}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue ? newValue.recordId : null)
                  formik.setFieldValue('cashAccountRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('cashAccountName', newValue ? newValue.name : '')
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
                    readOnly={readOnly}
                    required
                    label={labels.currency}
                    valueField='recordId'
                    displayField={['name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={async (event, newValue) => {
                      await getMultiCurrencyFormData(
                        newValue?.recordId,
                        formatDateForGetApI(formik.values.date),
                        RateDivision.FINANCIALS
                      )
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
                    disabled={formik.values.currencyId === defaultsDataState?.currencyId}
                  >
                    <img src='/images/buttonsIcons/popup.png' alt={platformLabels.add} />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='amount'
                required
                label={labels.amount}
                readOnly={readOnly}
                value={formik.values.amount}
                maxAccess={maxAccess}
                maxLength={'10'}
                decimalScale={2}
                onBlur={async e => {
                  if (!editMode) {
                    await getMultiCurrencyFormData(
                      formik.values.currencyId,
                      formatDateForGetApI(formik.values.date),
                      RateDivision.FINANCIALS,
                      Number(e.target.value.replace(/,/g, ''))
                    )
                  }
                }}
                onChange={e => formik.setFieldValue('amount', Number(e.target.value.replace(/,/g, '')))}
                onClear={async () => {
                  await getMultiCurrencyFormData(
                    formik.values.currencyId,
                    formatDateForGetApI(formik.values.date),
                    RateDivision.FINANCIALS,
                    0
                  )
                  formik.setFieldValue('amount', 0)
                }}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={LogisticsRepository.LoCollector.qry}
                name='collectorId'
                readOnly={readOnly}
                label={labels.collector}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('collectorId', newValue?.recordId || '')
                }}
                error={formik.touched.collectorId && Boolean(formik.errors.collectorId)}
                maxAccess={maxAccess}
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
            <Grid item xs={6}>
              <ResourceComboBox
                neverPopulate
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='templateId'
                label={labels.descriptionTemplate}
                readOnly={readOnly}
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
                readOnly={readOnly}
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
