import { Button, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import MultiCurrencyRateForm from '@argus/shared-ui/src/components/Shared/MultiCurrencyRateForm'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

export default function PaymentOrdersForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PaymentOrder,
    editMode: !!recordId
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PaymentOrder,
    access,
    enabled: !recordId
  })

  useSetWindow({ title: labels.PaymentOrder, window })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentOrders.page2
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)
  const currencyId = parseInt(defaultsData?.list?.find(obj => obj.key === 'currencyId')?.value)
  const cashAccountId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'cashAccountId')?.value)

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId: null,
      reference: '',
      accountId: '',
      accountType: '',
      currencyId: parseInt(currencyId),
      currencyName: '',
      paymentMethod: null,
      date: new Date(),
      amount: null,
      notes: '',
      exRate: 1,
      rateCalcMethod: 1,
      baseAmount: null,
      dtId: null,
      status: 1,
      releaseStatus: null,
      cashAccountId: parseInt(cashAccountId),
      plantId: parseInt(plantId)
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      accountType: yup.number().required(),
      currencyId: yup.number().required(),
      date: yup.string().required(),
      paymentMethod: yup.string().required(),
      amount: yup.number().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const data = {
        header: {
          ...obj,
          date: formatDateToApi(obj.date),
          recordId
        },
        items: [],
        costCenters: []
      }

      const response = await postRequest({
        extension: FinancialRepository.PaymentOrders.set2,
        record: JSON.stringify(data)
      })

      !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
      getPaymentOrder(response.recordId)

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

  const { labels: _labels, access: MRCMaxAccess } = useResourceQuery({
    endpointId: MultiCurrencyRepository.Currency.get,
    datasetId: ResourceIds.MultiCurrencyRate
  })

  async function getMultiCurrencyFormData(currencyId, date) {
    if (currencyId && date) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${
          RateDivision.FINANCIALS
        }`
      })

      const updatedRateRow = getRate({
        amount: formik.values.amount,
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
      title: platformLabels.MultiCurrencyRate
    })
  }

  const isCancelled = formik.values.status === -1
  const isClosed = formik.values.wip == 2
  const editMode = !!formik.values.recordId

  async function getPaymentOrder(recordId) {
    const res = await getRequest({
      extension: FinancialRepository.PaymentOrders.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res.record.date)
    })
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
        getPaymentOrder(recordId)
      } else {
        getCashAccountAndPayment(cashAccountId)
      }
    })()
  }, [])

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PaymentOrder,
        recordId: formik.values.recordId
      }
    })
  }

  const onCancel = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentOrders.cancel,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Cancelled)
      invalidate()
      getPaymentOrder(res.recordId)
    }
  }

  function confirmation(dialogText, titleText, event) {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: dialogText,
        okButtonAction: async () => {
          await event()
        },
        fullScreen: false,
        close: true
      },
      width: 400,
      height: 150,
      title: titleText
    })
  }

  const onClose = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentOrders.close,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Closed)
      invalidate()
      getPaymentOrder(res.recordId)
    }
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: FinancialRepository.PaymentOrders.reopen,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Reopened)
      invalidate()
      getPaymentOrder(res.recordId)
    }
  }

  const actions = [
    {
      key: 'Cancel',
      condition: true,
      onClick: () => {
        confirmation(platformLabels.CancelConf, platformLabels.Confirmation, onCancel)
      },
      disabled: !editMode || isCancelled
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
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode || isCancelled
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isCancelled
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.PaymentOrder}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      functionId={SystemFunction.PaymentOrder}
      disabledSubmit={isClosed || isCancelled}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_dgId=${SystemFunction.PaymentOrder}&_startAt=${0}&_pageSize=${50}`}
                filter={!editMode ? item => item.activeStatus === 1 : undefined}
                name='dtId'
                label={labels.documentType}
                readOnly={editMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={async (_, newValue) => {
                  await changeDT(newValue)
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
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
                    filter={item => item.currencyType === 1}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    readOnly={isClosed || isCancelled}
                    values={formik.values}
                    onChange={(_, newValue) => {
                      getMultiCurrencyFormData(newValue?.recordId, formik.values.date)
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                      formik.setFieldValue('currencyName', newValue?.name || '')
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CustomButton
                    onClick={() => openMCRForm(formik.values)}
                    image='popup.png'
                    tooltipText={platformLabels.MultiCurrencyRate}
                    disabled={!formik.values.currencyId || formik.values.currencyId === currencyId}
                  />
                </Grid>
              </Grid>
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
                datasetId={DataSets.PAYMENT_METHOD}
                name='paymentMethod'
                label={labels.paymentMethod}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={isClosed || isCancelled}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  if (!newValue?.key) {
                    formik.setFieldValue('cashAccountId', '')
                  }
                  formik.setFieldValue('paymentMethod', newValue?.key || null)
                }}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
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
                  await getMultiCurrencyFormData(formik.values.currencyId, newValue)
                }}
                onClear={() => formik.setFieldValue('date', null)}
                readOnly={isClosed || isCancelled}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0`}
                name='cashAccountId'
                readOnly={isClosed || isCancelled}
                label={labels.cashAccount}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                readOnly={isClosed || isCancelled}
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
              <CustomNumberField
                name='amount'
                required
                label={labels.amount}
                maxLength={'10'}
                decimalScale={2}
                readOnly={isClosed || isCancelled}
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
                onClear={() => {
                  formik.setFieldValue('amount', '')
                }}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
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
                readOnly={isClosed || isCancelled}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  if (!newValue?.key) {
                    formik.setFieldValue('accountId', null)
                    formik.setFieldValue('accountRef', '')
                    formik.setFieldValue('accountName', '')
                  }
                  formik.setFieldValue('accountType', newValue?.key || null)
                }}
                error={formik.touched.accountType && Boolean(formik.errors.accountType)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                neverPopulate={true}
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='templateId'
                label={labels.descriptionTemplate}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  const notes = formik.values.notes || ''
                  if (newValue?.name) formik.setFieldValue('notes', notes === '' ? newValue.name : `${notes}\n${newValue.name}`)
                  formik.setFieldValue('templateId',newValue?.recordId || null)
                }}
                readOnly={isClosed || isCancelled}
                error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                name='accountId'
                readOnly={isClosed || isCancelled || !formik.values.accountType}
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
                  formik.setFieldValue('accountRef', newValue?.reference || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
                  formik.setFieldValue('accountGroupName', newValue?.groupName || '')
                  formik.setFieldValue('accountId', newValue?.recordId || null)
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextArea
                name='notes'
                type='text'
                label={labels.notes}
                value={formik.values.notes}
                rows={3}
                readOnly={isClosed || isCancelled}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

PaymentOrdersForm.width = 950
PaymentOrdersForm.height = 450
