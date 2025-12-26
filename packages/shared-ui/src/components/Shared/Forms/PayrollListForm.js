import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

export default function PayrollListForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const pytvStartDate = parseInt(defaultsData?.list?.find(({ key }) => key === 'pytvStartDate')?.value) || null
  const pytvEndDate = parseInt(defaultsData?.list?.find(({ key }) => key === 'pytvEndDate')?.value) || null

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.Payroll.page
  })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PayrollHeader,
    editMode: !!recordId
  })
  
  useSetWindow({ title: labels.payrollList, window })
      

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PayrollList,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId, reference: documentType?.reference },
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
      periodId: yup.number().required(),
      date: yup.date().required(),
      payDate: yup.date().required(),
      startDate: yup.date().required(),
      endDate: yup.date().required(),
      fiscalYear: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PayrollRepository.Payroll.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2
  const isPosted = formik.values.status === 3

  const refetchForm = async recordId => {
    if (recordId) {
      const res = await getRequest({
        extension: PayrollRepository.Payroll.get,
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
      extension: PayrollRepository.Payroll.close,
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
    await postRequest({
      extension: PayrollRepository.Payroll.post,
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
    refetchForm(recordId)
    invalidate()
  }

  const onUnpost = async () => {
    const res = await postRequest({
      extension: PayrollRepository.Payroll.unpost,
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
      extension: PayrollRepository.Payroll.reopen,
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
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isPosted
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
      disabled: !editMode || !isClosed
    }
  ]

  const calculateTADates = (periodStartDate, periodEndDate, pytvStartDate, pytvEndDate) => {
    if (!periodStartDate || !periodEndDate) return {}

    const ps = new Date(periodStartDate)
    const pe = new Date(periodEndDate)

    const taEndDate = new Date(pe.getFullYear(), pe.getMonth(), pytvEndDate)

    let taStartMonth = ps.getMonth()
    let taStartYear = ps.getFullYear()

    if (pytvStartDate > ps.getDate()) {
      taStartMonth -= 1
      if (taStartMonth < 0) {
        taStartMonth = 11
        taStartYear -= 1
      }
    }

    const taStartDate = new Date(taStartYear, taStartMonth, pytvStartDate)

    return { taStartDate, taEndDate }
  }

  return (
    <FormShell
      resourceId={ResourceIds.PayrollHeader}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      functionId={SystemFunction.PayrollList}
      disabledSubmit={isClosed}
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
                readOnly={isClosed}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PayrollRepository.FiscalYear.qry}
                name='fiscalYear'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                readOnly={isClosed}
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
                endpointId={PayrollRepository.Period.qry}
                parameters={
                  formik.values.fiscalYear &&
                  formik.values.salaryType &&
                  `_year=${formik.values.fiscalYear}&_salaryType=${formik.values.salaryType}&_status=0`
                }
                name='periodId'
                label={labels.period}
                valueField='periodId'
                required
                displayField='periodName'
                values={formik.values}
                readOnly={isClosed}
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
                readOnly={isClosed}
                onChange={(_, value) => {
                  if (value && formik.values.salaryType === 5) {
                    const date = new Date(value)
                    const start = new Date(date.getFullYear(), date.getMonth(), 1)

                    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

                    const diffMs = end.getTime() - start.getTime()
                    const diffDays = diffMs / (1000 * 60 * 60 * 24) + 1

                    formik.setFieldValue('calendarDays', diffDays)
                    formik.setFieldValue('startDate', start)
                    formik.setFieldValue('endDate', end)
                    formik.setFieldTouched('startDate', false, false)
                    formik.setFieldTouched('endDate', false, false)

                    if (pytvStartDate && pytvEndDate) {
                      const { taStartDate, taEndDate } = calculateTADates(start, end, pytvStartDate, pytvEndDate)

                      formik.setFieldValue('taStartDate', taStartDate)
                      formik.setFieldValue('taEndDate', taEndDate)
                    }
                  }

                  formik.setFieldValue('payDate', value)
                }}
                onClear={() => {
                  formik.setFieldValue('payDate', null)
                  formik.setFieldValue('calendarDays', '')
                  formik.setFieldValue('startDate', null)
                  formik.setFieldValue('endDate', null)
                  formik.setFieldValue('taStartDate', null)
                  formik.setFieldValue('taEndDate', null)
                }}
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
                required
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
                required
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='taStartDate'
                label={labels.taStartDate}
                value={formik?.values?.taStartDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly
                onClear={() => formik.setFieldValue('taStartDate', null)}
                error={formik.touched.taStartDate && Boolean(formik.errors.taStartDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='taEndDate'
                label={labels.taEndDate}
                value={formik?.values?.taEndDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                readOnly
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
                readOnly
                maxAccess={maxAccess}
                error={formik.touched.calendarDays && Boolean(formik.errors.calendarDays)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                maxAccess={maxAccess}
                readOnly={isClosed}
                rows={3}
                maxLength='128'
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

PayrollListForm.width = 850
PayrollListForm.height = 700