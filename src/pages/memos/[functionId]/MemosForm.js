import { Checkbox, FormControlLabel, Grid } from '@mui/material'
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
import { formatDateFromApi } from 'src/lib/date-helper'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'

export default function MemosForm({ labels, access, recordId, functionId }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })

  const [initialVatPct, setInitialVatPct] = useState('')

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.FiMemo.qry
  })

  const getSetEndpoint = functionId => {
    switch (functionId) {
      case SystemFunction.CreditNote:
        return FinancialRepository.CreditNote.set
      case SystemFunction.DebitNote:
        return FinancialRepository.DebitNote.set
      case SystemFunction.ServiceBill:
        return FinancialRepository.ServiceBillReceived.set
      case SystemFunction.ServiceInvoice:
        return FinancialRepository.ServiceInvoice.set
      default:
        return null
    }
  }

  console.log(SystemFunction.DebitNote, 'systemFunction')
  console.log(functionId, 'funcId')

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      dtId: documentType?.dtId || null,
      reference: '',
      date: new Date(),
      plantId: '',
      currencyId: '',
      status: '',
      accountId: '',
      descriptionTemplate: '',
      amount: '',
      baseAmount: '',
      functionId: functionId,
      vatPct: '',
      exRate: '',
      rateCalcMethod: '',
      subtotal: '',
      notes: '',
      vatAmount: '',
      isSubjectToVAT: false
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      amount: yup.number().required(' '),
      currencyId: yup.string().required(' '),
      accountId: yup.string().required(' '),
      subtotal: yup.number().required(' '),
      date: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId
      if (!recordId) {
        obj.baseAmount = obj.amount
        obj.status = 1
        obj.rateCalcMethod = 1
        obj.exRate = 1
      }

      const response = await postRequest({
        extension: getSetEndpoint(parseInt(formik.values.functionId)),
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          baseAmount: obj.amount,

          recordId: response.recordId
        })
      } else {
        toast.success('Record Edited Successfully')
      }

      try {
        const res = await getRequest({
          extension: FinancialRepository.FiMemo.get,
          parameters: `_recordId=${response.recordId}`
        })

        formik.setFieldValue('reference', res.record.reference)
      } catch (error) {}
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        const res = await getRequest({
          extension: SystemRepository.Defaults.qry,
          parameters: `_filter=vatPct`
        })

        const vatPctValue = res.list.find(item => item.key === 'vatPct')?.value || '0'
        setInitialVatPct(vatPctValue)
      } catch (exception) {
        console.error('Error fetching vatPct value:', exception)
      }
    })()
  }, [])
  useEffect(() => {
    let calculatedAmount = parseInt(formik.values.subtotal)

    if (formik.values.isSubjectToVAT) {
      formik.setFieldValue('vatPct', initialVatPct)
      const vatAmount = formik.values.subtotal / initialVatPct
      formik.setFieldValue('vatAmount', vatAmount)
      calculatedAmount += vatAmount
    } else {
      formik.setFieldValue('vatPct', '')
      formik.setFieldValue('vatAmount', 0)
    }

    formik.setFieldValue('amount', calculatedAmount)
  }, [formik.values.isSubjectToVAT, initialVatPct, formik.values.subtotal])

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: FinancialRepository.FiMemo.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues({
            ...res.record,

            date: formatDateFromApi(res.record.date)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  const onPost = async () => {
    try {
      const res = await postRequest({
        extension: FinancialRepository.FiMemo.post,
        record: JSON.stringify(formik.values)
      })

      if (res?.recordId) {
        toast.success('Record Posted Successfully')
        invalidate()

        try {
          const getRes = await getRequest({
            extension: FinancialRepository.FiMemo.get,
            parameters: `_recordId=${formik.values.recordId}`
          })

          getRes.record.date = formatDateFromApi(getRes.record.date)
          formik.setValues(getRes.record)
        } catch (getError) {}
      }
    } catch (postError) {}
  }

  const onCancel = async () => {
    try {
      const res = await postRequest({
        extension: FinancialRepository.FiMemo.cancel,
        record: JSON.stringify(formik.values)
      })

      if (res?.recordId) {
        toast.success('Record Canceled Successfully')
        invalidate()

        try {
          const getRes = await getRequest({
            extension: FinancialRepository.FiMemo.get,
            parameters: `_recordId=${formik.values.recordId}`
          })

          getRes.record.date = formatDateFromApi(getRes.record.date)
          formik.setValues(getRes.record)
        } catch (getError) {}
      }
    } catch (cancelError) {}
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
      disabled: !editMode
    },
    {
      key: 'FI Trx',
      condition: true,
      onClick: 'onClickIT',
      disabled: !editMode
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || formik.values.status === -1 || formik.values.status === 3
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || formik.values.status === -1 || formik.values.status === 3
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
  console.log(formik.values, 'formik')

  return (
    <FormShell
      resourceId={getResourceId(parseInt(formik.values.functionId))}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={formik.values.functionId}
      previewReport={editMode}
      disabledSubmit={formik.values.status === -1 || formik.values.status === 3}
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
                      formik && formik.setFieldValue('dtId', newValue?.recordId || '')
                      formik && formik.setFieldValue('status', newValue?.activeStatus)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={editMode}
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
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
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
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
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={FinancialRepository.Account.snapshot}
                    parameters={{
                      _type: 2
                    }}
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
                      { key: 'name', value: 'Name' },
                      { key: 'keywords', value: 'Keywords' },
                      { key: 'groupName', value: 'Account Group' }
                    ]}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        formik.setFieldValue('accountId', newValue?.recordId || '')
                        formik.setFieldValue('accountRef', newValue?.reference)
                        formik.setFieldValue('accountName', newValue?.name)
                      } else {
                        formik.setFieldValue('accountId', null)
                        formik.setFieldValue('accountRef', null)
                        formik.setFieldValue('accountName', null)
                      }
                    }}
                    error={formik.touched.accountId && Boolean(formik.errors.accountId) && !formik.values.accountId}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={FinancialRepository.DescriptionTemplate.qry}
                    label={labels.descriptionTemplate}
                    displayField='name'
                    name='descriptionTemplate'
                    value={null}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        const descriptionTemplateName = newValue?.name || ''
                        const currentNotes = formik.values.notes

                        const updatedNotes = currentNotes
                          ? `${currentNotes}\n${descriptionTemplateName}`
                          : descriptionTemplateName

                        formik.setFieldValue('notes', updatedNotes)
                      }

                      formik.setFieldValue('descriptionTemplate', null)
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    maxLength='100'
                    rows={3}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Right side - Last 5 Grid items */}
            <Grid item xs={6}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='subtotal'
                    required
                    label={labels.subtotal}
                    value={formik.values.subtotal}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isSubjectToVAT'
                        maxAccess={maxAccess}
                        checked={formik.values?.isSubjectToVAT}
                        onChange={formik.handleChange}
                      />
                    }
                    label={labels.vat}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='amount'
                    type='text'
                    readOnly
                    label={labels.amount}
                    value={formik.values.amount}
                    required
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('amount', e.target.value)}
                    onClear={() => formik.setFieldValue('amount', '')}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    maxLength={10}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
