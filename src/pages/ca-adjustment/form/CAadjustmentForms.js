import { Grid } from '@mui/material'
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
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useWindow } from 'src/windows'
import WorkFlow from 'src/components/Shared/WorkFlow'

export default function CAadjustmentForm({ labels, access, recordId, functionId }) {
  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: functionId,
    access: access,
    enabled: !recordId
  })
  const { stack } = useWindow()

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CAadjustment.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: '',
      name: '',
      dtId: documentType?.dtId,
      plantId: '',
      date: new Date(),
      currencyId: '',
      status: '',
      cashAccountId: '',
      amount: '',
      baseAmount: '',
      exRate: '',
      rateCalcMethod: '',
      functionId: functionId,
      notes: ''
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      amount: yup.string().required(' '),
      currencyId: yup.string().required(' '),
      cashAccountId: yup.string().required(' '),
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
        extension: CashBankRepository.CAadjustment.set,
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
          extension: CashBankRepository.CAadjustment.get,
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
        if (recordId) {
          const res = await getRequest({
            extension: CashBankRepository.CAadjustment.get,
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
        extension: CashBankRepository.CAadjustment.post,
        record: JSON.stringify(formik.values)
      })

      if (res?.recordId) {
        toast.success('Record Posted Successfully')
        invalidate()

        try {
          const getRes = await getRequest({
            extension: CashBankRepository.CAadjustment.get,
            parameters: `_recordId=${formik.values.recordId}`
          })

          getRes.record.date = formatDateFromApi(getRes.record.date)
          formik.setValues(getRes.record)
        } catch (getError) {}
      }
    } catch (postError) {}
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: formik.values.functionId,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
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
      disabled: !editMode
    },

    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || formik.values.status !== 1
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Cash Transaction',
      condition: true,
      onClick: 'transactionClicked',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.IncreaseDecreaseAdj}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={functionId}
      previewReport={editMode}
      disabledSubmit={formik.values.status !== 1}
    >
      <VertLayout>
        <Grow>
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
                  formik && formik.setFieldValue('dtId', newValue?.recordId)
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
                readOnly={formik.values.status == '3'}
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
                readOnly={formik.values.status == '3'}
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
                readOnly={formik.values.status == '3'}
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
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                readOnly={formik.values.status == '3'}
                valueField='reference'
                displayField='name'
                name='cashAccountId'
                required
                label={labels.cashAccount}
                form={formik}
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('cashAccountId', newValue?.recordId)
                    formik.setFieldValue('cashAccountRef', newValue?.reference)
                    formik.setFieldValue('cashAccountName', newValue?.name)
                  } else {
                    formik.setFieldValue('cashAccountId', null)
                    formik.setFieldValue('cashAccountRef', null)
                    formik.setFieldValue('cashAccountName', null)
                  }
                }}
                errorCheck={'cashAccountId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                type='text'
                label={labels.amount}
                value={formik.values.amount}
                readOnly={formik.values.status == '3'}
                required
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('amount', e.target.value)}
                onClear={() => formik.setFieldValue('amount', '')}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                maxLength={10}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                readOnly={formik.values.status == '3'}
                value={formik.values.notes}
                maxLength='100'
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
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
