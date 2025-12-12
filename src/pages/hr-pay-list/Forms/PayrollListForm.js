import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { DataSets } from 'src/resources/DataSets'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function PayrollListForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.PayrollFilters.page
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PayrollList,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      dtId: null,
      reference: '',
      fiscalYear: null,
      salaryType: 5,
      date: new Date(),
      payDate: null,
      startDate: null,
      endDate: null,
      taStartDate: null,
      taEndDate: null,
      calendarDays: null,
      periodId: null,
      notes: '',
      status: 1
    },
    validationSchema: yup.object({
      date: yup.date().required(),
      periodId: yup.number().required(),
      payDate: yup.date().required(),
      taStartDate: yup.date().required(),
      taEndDate: yup.date().required(),
      fiscalYear: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: PayrollRepository.PayrollFilters.set,
        record: JSON.stringify({
          ...obj
        })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
      window.close()
    }
  })

  console.log(formik)
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2
  const isPosted = formik.values.status === 3

  const refetchForm = async recordId => {
    if (recordId) {
      const res = await getRequest({
        extension: PayrollRepository.PayrollFilters.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res.record.date),
        payDate: formatDateFromApi(res.record.payDate),
        startDate: formatDateFromApi(res.record.startDate),
        endDate: formatDateFromApi(res.record.endDate),
        taStartDate: formatDateFromApi(res.record.taStartDate),
        taEndDate: formatDateFromApi(res.record.taEndDate)
      })
    }
  }

  useEffect(() => {
    refetchForm(recordId)
  }, [])

  const onClose = async () => {
    const res = await postRequest({
      extension: PayrollRepository.PayrollFilters.close,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        payDate: formatDateToApi(formik.values.payDate),
        startDate: formatDateToApi(formik.values.startDate),
        endDate: formatDateToApi(formik.values.endDate),
        taStartDate: formatDateToApi(formik.values.taStartDate),
        taEndDate: formatDateToApi(formik.values.taEndDate)
      })
    })

    toast.success(platformLabels.Closed)
    refetchForm(res?.recordId)
    invalidate()
  }

  const onPost = async () => {
    const res = await postRequest({
      extension: PayrollRepository.PayrollFilters.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        payDate: formatDateToApi(formik.values.payDate),
        startDate: formatDateToApi(formik.values.startDate),
        endDate: formatDateToApi(formik.values.endDate),
        taStartDate: formatDateToApi(formik.values.taStartDate),
        taEndDate: formatDateToApi(formik.values.taEndDate)
      })
    })

    toast.success(platformLabels.Posted)
    refetchForm(res?.recordId)
    invalidate()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: PayrollRepository.PayrollFilters.post,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        payDate: formatDateToApi(formik.values.payDate),
        startDate: formatDateToApi(formik.values.startDate),
        endDate: formatDateToApi(formik.values.endDate),
        taStartDate: formatDateToApi(formik.values.taStartDate),
        taEndDate: formatDateToApi(formik.values.taEndDate)
      })
    })

    toast.success(platformLabels.Unposted)
    refetchForm(res?.recordId)
    invalidate()
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: PayrollRepository.PayrollFilters.reopen,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        payDate: formatDateToApi(formik.values.payDate),
        startDate: formatDateToApi(formik.values.startDate),
        endDate: formatDateToApi(formik.values.endDate),
        taStartDate: formatDateToApi(formik.values.taStartDate),
        taEndDate: formatDateToApi(formik.values.taEndDate)
      })
    })

    toast.success(platformLabels.Reopened)
    refetchForm(res?.recordId)
    invalidate()
  }

  const actions = [
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLPayrollList,
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !editMode
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || !isClosed
    },
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onUnpost,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.PayrollFilter}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.PayrollList}`}
                name='dtId'
                label={labels.docType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  await changeDT(newValue)
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={!editMode && maxAccess}
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.SALARY_TYPE}
                name='salaryType'
                label={labels.salaryType}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                readOnly
                onChange={(_, newValue) => formik.setFieldValue('salaryType', newValue?.key || null)}
                error={formik.touched.salaryType && Boolean(formik.errors.salaryType)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalPeriod.qry}
                name='periodId'
                label={labels.period}
                valueField='periodId'
                displayField='name'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('periodId', newValue?.periodId || null)}
                error={formik.touched.periodId && Boolean(formik.errors.periodId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='payDate'
                required
                label={labels.payDate}
                value={formik?.values?.payDate}
                maxAccess={maxAccess}
                onChange={(name, value) => {
                  if (value && formik.values.salaryType === 5) {
                    const date = new Date(value)
                    const start = new Date(date.getFullYear(), date.getMonth(), 1)

                    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

                    const diffMs = end.getTime() - start.getTime()
                    const diffDays = diffMs / (1000 * 60 * 60 * 24) + 1

                    formik.setFieldValue('calendarDays', diffDays)

                    formik.setFieldValue('startDate', start)
                    formik.setFieldValue('endDate', end)
                  }

                  formik.setFieldValue('payDate', value)
                }}
                onClear={() => formik.setFieldValue('payDate', null)}
                error={formik.touched.payDate && Boolean(formik.errors.payDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik?.values?.startDate}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.endDate}
                value={formik?.values?.endDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='taStartDate'
                required
                label={labels.taStartDate}
                value={formik?.values?.taStartDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('taStartDate', null)}
                error={formik.touched.taStartDate && Boolean(formik.errors.taStartDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='taEndDate'
                required
                label={labels.taEndDate}
                value={formik?.values?.taEndDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('taEndDate', null)}
                error={formik.touched.taEndDate && Boolean(formik.errors.taEndDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='calendarDays'
                label={labels.calendarDays}
                value={formik.values.calendarDays}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('calendarDays', '')}
                readOnly={editMode}
                error={formik.touched.calendarDays && Boolean(formik.errors.calendarDays)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                maxAccess={maxAccess}
                rows={3}
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
