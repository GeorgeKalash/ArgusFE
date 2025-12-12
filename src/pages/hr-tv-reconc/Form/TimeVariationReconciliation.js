import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import useResourceParams from 'src/hooks/useResourceParams'
import useSetWindow from 'src/hooks/useSetWindow'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function TimeVariationReconciliationForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  dayjs.extend(utc)

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.TimeVariationReconciliation,
    editMode: !!recordId
  })

  useSetWindow({ title: labels?.TimeVariationReconciliation, window })

  const invalidate = useInvalidate({
    endpointId: TimeAttendanceRepository.TimeVariation.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      reference: '',
      dayIdDate: new Date(),
      employeeId: null,
      name: '',
      dataSource: 2,
      timeCode: 20,
      clockDuration: time(0),
      duration: time(0),
      damageLevel: null,
      justification: '',
      releaseStatus: null,
      wip: 1,
      status: 1
    },
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      date: yup.date().required(),
      timeCode: yup.number().required(),
      damageLevel: yup.number().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: TimeAttendanceRepository.TimeVariation.set,
        record: JSON.stringify({
          ...values,
          clockDuration: timeToMinutes(values.clockDuration),
          duration: timeToMinutes(values.duration),
          date: formatDateToApi(values.date)
        })
      })
      toast.success(platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2
  const isCancelled = formik.values.status == -1
  const isPosted = formik.values.status === 3

  const actions = [
    {
      key: 'Close',
      condition: true,
      onClick: onClose,
      disabled: isPosted || !editMode
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isPosted
    }
  ]

  function timeToMinutes(timeStr) {
    if (!timeStr) return 0
    const negative = timeStr.startsWith('-')
    const [h, m] = timeStr.replace('-', '').split(':').map(Number)
    const total = h * 60 + m

    return negative ? -total : total
  }

  async function onClose() {
    const res = await postRequest({
      extension: TimeAttendanceRepository.TimeVariation.close,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values?.date),
        clockDuration: timeToMinutes(formik.values?.clockDuration),
        duration: timeToMinutes(formik.values?.duration)
      })
    })
    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res.recordId)
  }

  async function onCancel() {
    const res = await postRequest({
      extension: TimeAttendanceRepository.TimeVariation.cancel,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values?.date),
        clockDuration: timeToMinutes(formik.values.clockDuration),
        duration: timeToMinutes(formik.values.duration)
      })
    })
    toast.success(platformLabels.Cancelled)
    invalidate()
    refetchForm(res.recordId)
  }

  function time(minutes = 0) {
    if (minutes == 0) return '00:00'
    const absMinutes = Math.abs(minutes)
    const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0')
    const mins = String(absMinutes % 60).padStart(2, '0')

    return (minutes < 0 ? '-' : '') + `${hours}:${mins}`
  }

  async function loadData(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: TimeAttendanceRepository.TimeVariation.get,
      parameters: `_recordId=${recordId}`
    })

    return res
  }

  async function refetchForm(recordId) {
    const res = await loadData(recordId)
    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res?.record?.date),
      clockDuration: time(res?.record?.clockDuration),
      duration: time(res?.record?.duration)
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await loadData(recordId)
        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res?.record?.date),
          clockDuration: time(res?.record?.clockDuration),
          duration: time(res?.record?.duration)
        })
      }
    })()
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.TimeVariationReconciliation}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      isCleared={false}
      isInfo={false}
      disabledSubmit={isCancelled || isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values?.date}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('date', newValue)
                }}
                onClear={() => {
                  formik.setFieldValue('date', null)
                }}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='reference'
                displayField='fullName'
                name='employeeId'
                required
                readOnly
                label={labels.employee}
                form={formik}
                displayFieldWidth={2}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                name='branchName'
                label={labels.branch}
                value={formik?.values?.branchName}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('branchName', '')}
                error={formik.touched.branchName && Boolean(formik.errors.branchName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TIME_CODE}
                name='timeCode'
                label={labels.timeCode}
                valueField='key'
                displayField='value'
                required
                readOnly
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('timeCode', newValue?.key || null)
                }}
                error={formik.touched.timeCode && Boolean(formik.errors.timeCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='clockDuration'
                label={labels?.clockDuration}
                value={formik.values?.clockDuration}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('clockDuration', time(0))}
                error={formik.touched.clockDuration && Boolean(formik.errors.clockDuration)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='duration'
                label={labels.duration}
                value={formik.values.duration}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('duration', time(0))}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='statusName'
                label={labels.status}
                value={formik?.values?.statusName}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('statusName', null)}
                error={formik.touched.statusName && Boolean(formik.errors.statusName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='damageLevel'
                label={labels.damageLevel}
                datasetId={DataSets.DAMAGE_LEVEL}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                readOnly={isCancelled || isClosed}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('damageLevel', newValue?.key || null)}
                error={formik.touched.damageLevel && Boolean(formik.errors.damageLevel)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='justification'
                label={labels.justification}
                value={formik.values.justification}
                rows={2}
                readOnly={isCancelled || isClosed}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('justification', '')}
                error={formik.touched.justification && Boolean(formik.errors.justification)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
