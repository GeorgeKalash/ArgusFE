import { Button, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi } from 'src/lib/date-helper'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import MultiCurrencyRateForm from 'src/components/Shared/MultiCurrencyRateForm'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { useWindow } from 'src/windows'
import { RateDivision } from 'src/resources/RateDivision'
import { DIRTYFIELD_RATE, getRate } from 'src/utils/RateCalculator'
import AccountSummary from 'src/components/Shared/AccountSummary'
import { ApplyManual } from 'src/components/Shared/ApplyManual'

export default function MemosForm({ labels, access, recordId, functionId, getEndpoint, getGLResourceId }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const { stack } = useWindow()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [defaultsDataState, setDefaultsDataState] = useState(null)

  const [initialVatPct, setInitialVatPct] = useState('')

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
      currencyId: '',
      currencyName: '',
      status: '',
      accountId: '',
      amount: '',
      baseAmount: '',
      functionId: functionId,
      vatPct: '',
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
    enableReinitialize: false,
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

  async function getDefaultVAT() {
    const defaultVAT = defaultsData?.list?.find(({ key }) => key === 'vatPct')

    return parseInt(defaultVAT?.value)
  }

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
    ;(async function () {
      const vatPctValue = await getDefaultVAT()
      setInitialVatPct(vatPctValue)
    })()
  }, [])
  useEffect(() => {
    let calculatedAmount = parseFloat(formik.values.subtotal)

    if (formik.values.isSubjectToVAT) {
      formik.setFieldValue('vatPct', initialVatPct)
      const vatAmount = (calculatedAmount * parseFloat(initialVatPct)) / 100
      formik.setFieldValue('vatAmount', vatAmount)

      calculatedAmount += vatAmount
    } else {
      formik.setFieldValue('vatPct', '')
      formik.setFieldValue('vatAmount', 0)
    }

    formik.setFieldValue('amount', calculatedAmount)
    setBaseAmount(calculatedAmount)
  }, [formik.values.isSubjectToVAT, initialVatPct, formik.values.subtotal])

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
      await getDefaultsData()
    })()
  }, [])
  useEffect(() => {
    formik.setFieldValue('templateId', '')
  }, [formik.values.notes])

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
            moduleId: 1
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
          <Grid container spacing={4} justifyContent='space-between'>
            <Grid item xs={6}>
              <Grid container spacing={4}>
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
                      <Button
                        variant='contained'
                        size='small'
                        onClick={() => openMCRForm(formik.values)}
                        disabled={
                          !formik.values.currencyId || formik.values.currencyId === defaultsDataState?.currencyId
                        }
                      >
                        <img src='/images/buttonsIcons/popup.png' alt={platformLabels.add} />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={4}>
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
                    readOnly
                    label={labels.vatAmount}
                    value={formik.values.vatAmount}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('vatAmount', '')}
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
                endpointId={FinancialRepository.DescriptionTemplate.qry}
                name='templateId'
                label={labels.descriptionTemplate}
                valueField='recordId'
                readOnly={isPosted || isCancelled}
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
