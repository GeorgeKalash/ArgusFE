import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import MultiCurrencyRateForm from '@argus/shared-ui/src/components/Shared/MultiCurrencyRateForm'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { RateDivision } from '@argus/shared-domain/src/resources/RateDivision'
import { DIRTYFIELD_RATE, getRate } from '@argus/shared-utils/src/utils/RateCalculator'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'
import { ApplyManual } from '@argus/shared-ui/src/components/Shared/ApplyManual'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

export default function MemosForm({ labels, access, recordId, functionId, getEndpoint, getGLResourceId }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)

  const currencyId = parseInt(defaultsData?.list?.find(({ key }) => key === 'currencyId')?.value) || null
  const vatPct = parseInt(defaultsData?.list?.find(({ key }) => key === 'vatPct')?.value) || null

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.FiMemo.page
  })

  const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      dtId: null,
      reference: '',
      date: new Date(),
      plantId,
      currencyId,
      currencyName: '',
      status: '',
      accountId: '',
      amount: '',
      baseAmount: '',
      functionId: functionId,
      vatPct: 0,
      exRate: 1,
      rateCalcMethod: 1,
      subtotal: '',
      notes: '',
      vatAmount: '',
      isSubjectToVAT: false,
      sourceReference: '',
      dueDate: new Date()
    },
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    validateOnChange: true,
    validationSchema: yup.object({
      amount: yup.number().required(),
      currencyId: yup.string().required(),
      accountId: yup.string().required(),
      subtotal: yup.number().required(),
      date: yup.string().required(),
      dueDate: yup.string().required()
    }),
    onSubmit: async obj => {
      if (!obj.recordId) {
        obj.status = 1
        obj.rateCalcMethod = 1
      }

      const response = await postRequest({
        extension: getEndpoint(parseInt(formik.values.functionId)).set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          baseAmount: !formik.values.baseAmount ? obj.amount : formik.values.baseAmount,

          recordId: response.recordId
        })
      } else {
        toast.success(platformLabels.Edited)
      }

      const res = await getRequest({
        extension: FinancialRepository.FiMemo.get,
        parameters: `_recordId=${response.recordId}`
      })

      formik.setFieldValue('reference', res.record.reference)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId || !!recordId

  function setBaseAmount(amount) {
    const updatedRateRow = getRate({
      amount: amount ?? 0,
      exRate: formik.values?.exRate,
      baseAmount: 0,
      rateCalcMethod: formik.values?.rateCalcMethod,
      dirtyField: DIRTYFIELD_RATE
    })
    formik.setFieldValue('baseAmount', parseFloat(updatedRateRow?.baseAmount).toFixed(2) || 0)
  }

  useEffect(() => {
    let calculatedAmount = parseFloat(formik.values.subtotal)

    if (formik.values.isSubjectToVAT) {
      const currentVat = (formik?.values?.recordId ? formik?.values?.vatPct : vatPct) || 0
      const vatAmount = (calculatedAmount * parseFloat(currentVat)) / 100
      formik.setFieldValue('vatAmount', vatAmount)
      formik.setFieldValue('vatPct', currentVat)
      calculatedAmount += vatAmount
    } else {
      formik.setFieldValue('vatPct', '')
      formik.setFieldValue('vatAmount', 0)
    }

    formik.setFieldValue('amount', calculatedAmount)
    setBaseAmount(calculatedAmount)
  }, [formik.values.isSubjectToVAT, formik.values.subtotal])

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.FiMemo.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          dueDate: formatDateFromApi(res.record.dueDate),
          date: formatDateFromApi(res.record.date)
        })
      }
    })()
  }, [])

  const onPost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.FiMemo.post,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Posted)
      invalidate()

      const getRes = await getRequest({
        extension: FinancialRepository.FiMemo.get,
        parameters: `_recordId=${formik.values.recordId}`
      })

      getRes.record.date = formatDateFromApi(getRes.record.date)
      getRes.record.dueDate = formatDateFromApi(getRes.record.dueDate)
      formik.setValues(getRes.record)
    }
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: FinancialRepository.FiMemo.unpost,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Unposted)
      invalidate()

      const getRes = await getRequest({
        extension: FinancialRepository.FiMemo.get,
        parameters: `_recordId=${formik.values.recordId}`
      })

      getRes.record.date = formatDateFromApi(getRes.record.date)
      getRes.record.dueDate = formatDateFromApi(getRes.record.dueDate)
      formik.setValues(getRes.record)
    }
  }

  const onCancel = async () => {
    const res = await postRequest({
      extension: FinancialRepository.FiMemo.cancel,
      record: JSON.stringify(formik.values)
    })

    if (res?.recordId) {
      toast.success(platformLabels.Cancelled)
      invalidate()

      const getRes = await getRequest({
        extension: FinancialRepository.FiMemo.get,
        parameters: `_recordId=${formik.values.recordId}`
      })
      getRes.record.dueDate = formatDateFromApi(getRes.record.dueDate)
      getRes.record.date = formatDateFromApi(getRes.record.date)

      formik.setValues(getRes.record)
    }
  }
  const postedOrCanceled = formik.values.status === -1 || formik.values.status === 3
  const isPosted = formik.values.status === 3
  const isCancelled = formik.values.status === -1

  async function getMultiCurrencyFormData(currencyId, date, rateType, amount) {
    if (currencyId && date && rateType) {
      const res = await getRequest({
        extension: MultiCurrencyRepository.Currency.get,
        parameters: `_currencyId=${currencyId}&_date=${formatDateForGetApI(date)}&_rateDivision=${rateType}`
      })
      const amountValue = amount === 0 ? 0 : amount ?? formik.values.amount

      setBaseAmount(amountValue)
      formik.setFieldValue('exRate', res.record?.exRate ?? 1)
      formik.setFieldValue('rateCalcMethod', res.record?.rateCalcMethod ?? 1)
    }
  }

  const onReset = async () => {
    await postRequest({
      extension: FinancialRepository.ResetGLMemo.reset,
      record: JSON.stringify(formik.values)
    })
  }

  const openApply = () => {
    stack({
      Component: ApplyManual,
      props: {
        recordId: formik.values.recordId,
        accountId: formik.values.accountId,
        currencyId: formik.values.currencyId,
        functionId,
        readOnly: isPosted || isCancelled
      }
    })
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: getGLResourceId(parseInt(formik.values.functionId)),
      onReset: onReset,
      disabled: !editMode
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
      disabled: !editMode || isCancelled || isPosted
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
    },
    {
      key: 'Apply',
      condition: true,
      onClick: openApply,
      disabled: !editMode || !formik.values.accountId || !formik.values.currencyId
    }
  ]

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.CreditNote:
        return ResourceIds.CreditNote
      case SystemFunction.DebitNote:
        return ResourceIds.DebitNote
      case SystemFunction.ServiceBill:
        return ResourceIds.ServiceBillReceived
      case SystemFunction.ServiceInvoice:
        return ResourceIds.ServiceInvoice
      default:
        return null
    }
  }

  const getResourceMCR = functionId => {
    const fn = Number(functionId)
    switch (fn) {
      case SystemFunction.CreditNote:
        return ResourceIds.MCRCreditNote
      case SystemFunction.DebitNote:
        return ResourceIds.MCRDebitNote
      case SystemFunction.ServiceBill:
        return ResourceIds.MCRServiceBillReceived
      case SystemFunction.ServiceInvoice:
        return ResourceIds.MCRServiceInvoice
      default:
        return null
    }
  }

  function openMCRForm(data) {
    stack({
      Component: MultiCurrencyRateForm,
      props: {
        DatasetIdAccess: getResourceMCR(functionId),
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

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: FinancialRepository.FIDocTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('plantId', res?.record?.plantId ? res?.record?.plantId : plantId)

      return res
    }
  }

  useEffect(() => {
    if (formik.values.dtId && !recordId) getDTD(formik?.values?.dtId)
  }, [formik.values.dtId])

  return (
    <FormShell
      resourceId={getResourceId(parseInt(formik.values.functionId))}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={formik.values.functionId}
      previewReport={editMode}
      disabledSubmit={isCancelled || isPosted}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${formik.values.functionId}`}
                    name='dtId'
                    readOnly={editMode}
                    label={labels.doctype}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      changeDT(newValue)
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                      formik.setFieldValue('status', newValue?.activeStatus)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    readOnly={isPosted || isCancelled}
                    label={labels.date}
                    value={formik.values.date}
                    onChange={async (e, newValue) => {
                      formik.setFieldValue('date', newValue)
                      await getMultiCurrencyFormData(formik.values.currencyId, newValue, RateDivision.FINANCIALS)
                    }}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='dueDate'
                    readOnly={isPosted || isCancelled}
                    label={labels.dueDate}
                    value={formik.values.dueDate}
                    required
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('dueDate', '')}
                    error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    readOnly={isPosted || isCancelled}
                    label={labels.plant}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'plant Ref' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      const plantId = newValue?.recordId || ''
                      formik.setFieldValue('plantId', plantId)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={1} alignItems='center'>
                    <Grid item xs={8}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Currency.qry}
                        name='currencyId'
                        readOnly={isPosted || isCancelled}
                        label={labels.currency}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        values={formik.values}
                        required
                        maxAccess={maxAccess}
                        onChange={async (event, newValue) => {
                          await getMultiCurrencyFormData(
                            newValue?.recordId,
                            formik.values.date,
                            RateDivision.FINANCIALS
                          )
                          formik.setFieldValue('currencyId', newValue?.recordId)
                          formik.setFieldValue('currencyName', newValue?.name)
                        }}
                        error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                     <CustomButton
                        onClick={() => openMCRForm(formik.values)}
                        image='popup.png'
                        tooltipText={platformLabels.add}
                        disabled={
                          !formik.values.currencyId ||
                          formik.values.currencyId === currencyId
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='subtotal'
                    readOnly={isPosted || isCancelled}
                    required
                    label={labels.subtotal}
                    value={formik.values.subtotal}
                    maxAccess={maxAccess}
                    onChange={async e => {
                      formik.setFieldValue('subtotal', e.target.value)
                      setBaseAmount(e.target.value)
                    }}
                    onClear={() => formik.setFieldValue('subtotal', '')}
                    error={formik.touched.subtotal && Boolean(formik.errors.subtotal)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='vatPct'
                    readOnly
                    label={labels.vatPct}
                    value={formik.values.vatPct}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('vatPct', '')}
                    error={formik.touched.vatPct && Boolean(formik.errors.vatPct)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='vatAmount'
                    readOnly={!formik.values.isSubjectToVAT || isPosted || isCancelled}
                    required={formik.values.isSubjectToVAT}
                    label={labels.vatAmount}
                    value={formik.values.vatAmount}
                    maxAccess={maxAccess}
                    onChange={async e => {
                      const vatPct =
                        formik.values.subtotal != 0
                          ? (parseFloat(e.target.value) * 100) / parseFloat(formik.values.subtotal)
                          : 0
                      formik.setFieldValue('vatPct', parseFloat(vatPct).toFixed(2) || 0)
                      formik.setFieldValue('vatAmount', e.target.value)
                      const calcAmount = Number(e.target.value || 0) + Number(formik.values.subtotal)
                      formik.setFieldValue('amount', calcAmount)
                      setBaseAmount(calcAmount)
                    }}
                    onClear={() => {
                      formik.setFieldValue('vatAmount', 0)
                      formik.setFieldValue('amount', Number(formik.values.subtotal || 0))
                    }}
                    error={formik.touched.vatAmount && Boolean(formik.errors.vatAmount)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='isSubjectToVAT'
                    value={formik.values?.isSubjectToVAT}
                    onChange={event =>
                      !(isPosted || isCancelled) && formik.setFieldValue('isSubjectToVAT', event.target.checked)
                    }
                    label={labels.vat}
                    maxAccess={maxAccess}
                    readOnly={postedOrCanceled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='amount'
                    label={labels.amount}
                    value={formik.values.amount}
                    required
                    maxAccess={maxAccess}
                    thousandSeparator={false}
                    readOnly
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    maxLength={10}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={FinancialRepository.Account.snapshot}
                parameters={{
                  _type: 2
                }}
                readOnly={isPosted || isCancelled}
                valueField='reference'
                displayField='name'
                name='accountId'
                required
                label={labels.account}
                form={formik}
                valueShow='accountRef'
                secondValueShow='accountName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name', grid: 4 },
                  { key: 'keywords', value: 'Keywords' },
                  { key: 'groupName', value: 'Account Group' }
                ]}
                maxAccess={maxAccess}
                displayFieldWidth={2}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('accountRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('accountName', newValue ? newValue.name : '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId) && !formik.values.accountId}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                neverPopulate={true}
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='templateId'
                label={labels.descriptionTemplate}
                valueField='recordId'
                readOnly={isPosted || isCancelled}
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  const notes = formik.values.notes || ''
                  if (newValue?.name) formik.setFieldValue('notes', notes === '' ? newValue.name : `${notes}\n${newValue.name}`)
                  formik.setFieldValue('templateId',newValue?.recordId || null)
                }}
                error={formik.touched.templateId && Boolean(formik.errors.templateId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='sourceReference'
                readOnly={isPosted || isCancelled}
                maxLength='20'
                label={labels.sourceReference}
                value={formik.values.sourceReference}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('sourceReference', '')}
              />
            </Grid>
            <Grid item xs={6.01}>
              <CustomTextArea
                name='notes'
                type='text'
                label={labels.notes}
                readOnly={isPosted || isCancelled}
                value={formik.values.notes}
                rows={4}
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
