import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { formatDateFromApi, formatDateMDY, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import CustomComboBox from '@argus/shared-ui/src/components/Inputs/CustomComboBox'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

export default function TimeVariatrionForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const shiftStore = useRef([])
  dayjs.extend(utc)

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.TimeVariation,
    editMode: !!recordId
  })

  useSetWindow({ title: labels?.timeVariation, window })

  const invalidate = useInvalidate({
    endpointId: TimeAttendanceRepository.TimeVariation.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      reference: '',
      date: new Date(),
      employeeId: null,
      dataSource: 2,
      timeCode: 20,
      clockDuration: time(0),
      duration: 0,
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
        extension: TimeAttendanceRepository.TimeVariation.gen,
        record: JSON.stringify({ ...values, clockDuration: 0, date: formatDateToApi(values.date) })
      })
      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2
  const isCancelled = formik.values.status == -1

  const actions = [
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: 'onCloseConfirmation',
      action: onClose,
      disabled: isCancelled || isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: 'onOpenConfirmation',
      action: onReopen,
      disabled: isCancelled || !isClosed || !editMode
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isClosed || isCancelled
    }
  ]

  async function onClose() {
    const res = await postRequest({
      extension: TimeAttendanceRepository.TimeVariation.close,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values?.date), clockDuration: 0 })
    })
    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res.recordId)
  }

  async function onReopen() {
    const res = await postRequest({
      extension: TimeAttendanceRepository.TimeVariation.reopen,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values?.date), clockDuration: 0 })
    })
    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(res.recordId)
  }

  async function onCancel() {
    const res = await postRequest({
      extension: TimeAttendanceRepository.TimeVariation.cancel,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values?.date), clockDuration: 0 })
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

  async function getShiftData(employeeId, date) {
    const { list } = await getRequest({
      extension: TimeAttendanceRepository.FlatSchedule.qry,
      parameters:
        `_params=1|` + employeeId + '^2|' + dayjs(date).format('YYYYMMDD') + '^3|' + dayjs(date).format('YYYYMMDD')
    })

    const shiftData = list?.map(x => {
      const from = dayjs.utc(formatDateFromApi(x.dtFrom)).format('hh:mm A')
      const to = dayjs.utc(formatDateFromApi(x.dtTo)).format('hh:mm A')

      return { ...x, dtRange: `${from} - ${to}` }
    })

    shiftStore.current = shiftData || []

    return shiftData || []
  }

  async function fillShift(employeeId, date, timeCode) {
    if (!employeeId) {
      resetShiftFields()

      return
    }
    const shiftData = await getShiftData(employeeId, date)

    if (!shiftData?.length) {
      resetShiftFields()

      return
    }

    const { recordId, duration } = shiftData[0]
    if (timeCode != 20) {
      formik.setFieldValue('shiftId', recordId)
      formik.setFieldValue('duration', duration)
      formik.setFieldValue('clockDuration', time(duration))
    }
  }

  async function updateTerminationDate(employeeId) {
    if (!employeeId) {
      formik.setFieldValue('terminationDate', null)

      return
    }

    const res = await getRequest({
      extension: EmployeeRepository.QuickView.get,
      parameters: `_recordId=${employeeId}&_asOfDate=${formatDateMDY(new Date())}`
    })
    formik.setFieldValue('terminationDate', res?.record?.terminationDate || null)
  }

  function resetShiftFields() {
    formik.setFieldValue('shiftId', null)
    formik.setFieldValue('duration', 0)
    formik.setFieldValue('clockDuration', time(0))
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
      clockDuration: time(res?.record?.duration)
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await loadData(recordId)
        await getShiftData(res?.record?.employeeId, formatDateFromApi(res?.record?.date))
        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res?.record?.date),
          clockDuration: time(res?.record?.duration)
        })
      }
    })()
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.TimeVariation}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      isCleared={false}
      functionId={SystemFunction.TimeVariation}
      disabledSubmit={isCancelled || isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels?.reference}
                value={formik.values?.reference}
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
                readOnly={isCancelled || isClosed}
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
                  await fillShift(newValue?.recordId, formik.values.date, formik.values.timeCode)
                  await updateTerminationDate(newValue?.recordId)
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values?.date}
                onChange={async (_, newValue) => {
                  await fillShift(formik.values?.employeeId, newValue, formik.values?.timeCode)
                  formik.setFieldValue('date', newValue)
                }}
                onClear={() => {
                  resetShiftFields()
                  formik.setFieldValue('date', null)
                }}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
                readOnly={isCancelled || isClosed}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TIME_CODE}
                name='timeCode'
                readOnly={isCancelled || editMode}
                label={labels.timeCode}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  if (!newValue || newValue?.key == 20) resetShiftFields()
                  await fillShift(formik.values?.employeeId, formik.values?.date, newValue?.key)
                  formik.setFieldValue('timeCode', newValue?.key || null)
                }}
                error={formik.touched.timeCode && Boolean(formik.errors.timeCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='shiftId'
                label={labels.shift}
                valueField='recordId'
                displayField='dtRange'
                store={shiftStore?.current}
                value={formik.values.shiftId}
                readOnly={isCancelled || isClosed || formik.values?.timeCode == 20}
                onChange={(_, newValue) => formik.setFieldValue('shiftId', newValue?.recordId || null)}
                error={formik.touched.shiftId && Boolean(formik.errors.shiftId)}
                maxAccess={maxAccess}
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
              <CustomNumberField
                name='duration'
                label={labels.duration}
                value={formik.values.duration}
                maxAccess={maxAccess}
                readOnly={isCancelled || isClosed || formik.values?.timeCode == 20 || formik.values?.timeCode == 21}
                min={formik.values.timeCode == 20 || formik.values.timeCode == 21 ? 0 : 1}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('duration', null)}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='damageLevel'
                label={labels.damage}
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

TimeVariatrionForm.width = 550
TimeVariatrionForm.height = 550
