import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useInvalidate } from 'src/hooks/resource'
import { LoanTrackingRepository } from 'src/repositories/LoanTrackingRepository'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function DeductionForm({ labels, recordId, store, maxAccess, remainingBalance, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({ endpointId: LoanTrackingRepository.LoanDeduction.page })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      loanId: store.recordId,
      recordId: null,
      payrollDeduction: false,
      amount: null,
      date: new Date(),
      type: null,
      notes: ''
    },
    validationSchema: yup.object({
      amount: yup.number().required().max(remainingBalance, `Amount cannot exceed ${remainingBalance}`),
      date: yup.date().required(),
      type: yup.string().required()
    }),
    onSubmit: obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date),
        payrollDeduction: obj.type === 1
      }
      postRequest({
        extension: LoanTrackingRepository.LoanDeduction.set,
        record: JSON.stringify(data)
      }).then(res => {
        toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
        formik.setFieldValue('recordId', res.recordId)

        invalidate()
        window.close()
      })
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: LoanTrackingRepository.LoanDeduction.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res?.record,
          date: formatDateFromApi(res?.record?.date)
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.Loans}
      form={formik}
      maxAccess={maxAccess}
      disabledSubmit={!store.isClosed || formik.values.payrollDeduction}
      editMode={editMode}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CustomCheckBox
                name='payrollDeduction'
                value={formik.values?.payrollDeduction}
                readOnly
                label={labels.payrollDeduction}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                label={labels.deductionAmount}
                value={formik.values.amount}
                required
                readOnly={!store.isClosed || formik.values.payrollDeduction}
                maxAccess={maxAccess}
                onChange={async e => {
                  formik.setFieldValue('amount', e?.target?.value || null)
                }}
                onClear={async () => {
                  formik.setFieldValue('amount', null)
                }}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                maxLength={10}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                required
                min={store.effectiveDate}
                readOnly={!store.isClosed || formik.values.payrollDeduction}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LOAN_TYPE}
                name='type'
                label={labels.type}
                required
                readOnly={!store.isClosed || formik.values.payrollDeduction}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('type', newValue?.key || null)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                readOnly={!store.isClosed || formik.values.payrollDeduction}
                value={formik.values.notes}
                maxLength='100'
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
