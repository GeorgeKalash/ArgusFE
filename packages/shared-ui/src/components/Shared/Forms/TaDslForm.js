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
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import CustomTimePicker from '@argus/shared-ui/src/components/Inputs/CustomTimePicker'
import dayjs from 'dayjs'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

export default function TaDslForm({ recordId, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.ShiftLeave,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.duringShiftLeave, window })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.DuringShiftLeave,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: TimeAttendanceRepository.ShitLeave.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      employeeId: null,
      employeeRef: '',
      employeeName: '',
      reference: '',
      date: new Date(),
      leaveDate: null,
      reasonId: null,
      fromTime: null,
      toTime: null,
      realDuration: null,
      destination: null,
      notes: '',
      status: 1,
      wip: 1,

      departmentRef: '',
      departmentName: '',
      reportToRef: '',
      reportToName: '',
      departmentHeadName: '',
      departmentHeadRef: '',
      position: '',
      schedule: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      reasonId: yup.number().required(),
      duration: yup.string().required(),
      destination: yup.string().required(),
      leaveDate: yup.date().required(),
      fromTime: yup.string().required(),
      toTime: yup.string().required()
    }),
    onSubmit: async obj => {
      const {
        date,
        leaveDate,
        fromTime,
        toTime,
        returnTime,
        statusName,
        rsName,
        wipName,
        employeeRef,
        employeeName,
        departmentRef,
        departmentName,
        reportToRef,
        reportToName,
        departmentHeadName,
        departmentHeadRef,
        position,
        schedule,
        ...rest
      } = obj

      const response = await postRequest({
        extension: TimeAttendanceRepository.ShitLeave.set,
        record: JSON.stringify({
          ...rest,
          date: formatDateToApi(date),
          leaveDate: formatDateToApi(leaveDate),
          fromTime: dayjs(fromTime).format('HH:mm'),
          toTime: dayjs(toTime).format('HH:mm'),
          returnTime: dayjs(returnTime).format('HH:mm')
        })
      })
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      refetchForm(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId
  const isClosed = formik?.values?.wip === 2

  const {
    date,
    leaveDate,
    fromTime,
    toTime,
    returnTime,
    statusName,
    rsName,
    wipName,
    employeeRef,
    employeeName,
    departmentRef,
    departmentName,
    reportToRef,
    reportToName,
    departmentHeadName,
    departmentHeadRef,
    position,
    schedule,
    ...rest
  } = formik.values

  const onClose = async () => {
    await postRequest({
      extension: TimeAttendanceRepository.ShitLeave.close,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(date),
        leaveDate: formatDateToApi(leaveDate),
        fromTime: dayjs(fromTime).format('HH:mm'),
        toTime: dayjs(toTime).format('HH:mm'),
        returnTime: dayjs(returnTime).format('HH:mm')
      })
    })

    toast.success(platformLabels.Closed)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: TimeAttendanceRepository.ShitLeave.reopen,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(date),
        leaveDate: formatDateToApi(leaveDate),
        fromTime: dayjs(fromTime).format('HH:mm'),
        toTime: dayjs(toTime).format('HH:mm'),
        returnTime: dayjs(returnTime).format('HH:mm')
      })
    })

    toast.success(platformLabels.Reopened)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  async function refetchForm(recordId) {
    const { record } = await getRequest({
      extension: TimeAttendanceRepository.ShitLeave.get,
      parameters: `_recordId=${recordId}`
    })
    formik.setValues({
      ...record,
      date: formatDateFromApi(record.date),
      leaveDate: formatDateFromApi(record.leaveDate),
      fromTime: dayjs(record.fromTime, 'HH:mm'),
      toTime: dayjs(record.toTime, 'HH:mm'),
      returnTime: record?.returnTime?.trim() ? dayjs(record?.returnTime, 'HH:mm') : null
    })

    setViewField(record.employeeId)

    return record
  }

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  const actions = [
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
      disabled: !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  const formatDateTo = value => {
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}${month}${day}`
  }

  useEffect(() => {
    ;(async function () {
      if (formik.values.leaveDate && formik.values.employeeId) {
        const { list } = await getRequest({
          extension: TimeAttendanceRepository.FlatSchedule.qry,
          parameters:
            `_params=1|` +
            formik.values.employeeId +
            '^2|' +
            formatDateTo(formik.values.leaveDate) +
            '^3|' +
            formatDateTo(formik.values.leaveDate)
        })

        const schedule = list
          ?.map(x => {
            const from = dayjs(formatDateFromApi(x.dtFrom)).format('HH:mm')
            const to = dayjs(formatDateFromApi(x.dtTo)).format('HH:mm')

            return `[${from}..${to}]`
          })
          .join(' ')

        formik.setFieldValue('schedule', schedule)
      }
    })()
  }, [formik.values.employeeId, formik.values.leaveDate])

  useEffect(() => {
    const duration = getDuration(
      dayjs(formik.values.fromTime).format('HH:mm'),
      dayjs(formik.values.toTime).format('HH:mm')
    )
    formik.setFieldValue('duration', duration || 0)
  }, [formik.values.fromTime, formik.values.toTime])

  useEffect(() => {
    if (formik.values.returnTime) {
      const duration = getDuration(
        dayjs(formik.values.fromTime).format('HH:mm'),
        dayjs(formik.values.returnTime).format('HH:mm')
      )
      formik.setFieldValue('realDuration', duration || 0)
    } else {
      formik.setFieldValue('realDuration', null)
    }
  }, [formik.values.fromTime, formik.values.returnTime])

  const getDuration = (start, end) => {
    if (!start || !end || end === 'Invalid Date' || start === 'Invalid Date') return

    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)

    const startDate = new Date(0, 0, 0, startH, startM)
    const endDate = new Date(0, 0, 0, endH, endM)

    let diff = (endDate - startDate) / (1000 * 60)
    if (diff < 0) diff += 24 * 60

    const decimalHours = diff / 60

    return Number(decimalHours.toFixed(2))
  }

  async function setViewField(recordId) {
    if (recordId) {
      const { record } = await getRequest({
        extension: EmployeeRepository.QuickView.get,
        parameters: `_recordId=${recordId}&_asOfDate=${formatDateForGetApI(formik.values.date)}`
      })

      formik.setFieldValue('departmentRef', record?.departmentRef)
      formik.setFieldValue('departmentName', record?.departmentName)
      formik.setFieldValue('departmentHeadRef', record?.departmentHeadRef)
      formik.setFieldValue('departmentHeadName', record?.departmentHeadName)
      formik.setFieldValue('reportToRef', record?.reportToRef)
      formik.setFieldValue('reportToName', record?.reportToName)
      formik.setFieldValue(
        'position',
        `${record?.positionName || ''}${record?.positionRef ? ` ${record.positionRef}` : ''}`
      )
    }
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.ShiftLeave}
      functionId={SystemFunction.DuringShiftLeave}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      actions={actions}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <CustomTextField
                  name='reference'
                  label={labels.ref}
                  value={formik.values.reference}
                  maxAccess={maxAccess}
                  maxLength='30'
                  readOnly={editMode}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('reference', '')}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={6}>
                <CustomDatePicker
                  name='date'
                  label={labels.date}
                  value={formik.values.date}
                  onChange={formik.setFieldValue}
                  maxAccess={access}
                  readOnly
                  onClear={() => formik.setFieldValue('date', '')}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={EmployeeRepository.Employee.snapshot}
                  parameters={{ _branchId: 0 }}
                  filter={{ activeStatus: 1 }}
                  valueField='reference'
                  displayField='fullName'
                  name='employeeId'
                  required
                  readOnly={isClosed}
                  label={labels.employee}
                  secondFieldLabel={labels.employee}
                  form={formik}
                  displayFieldWidth={2}
                  valueShow='employeeRef'
                  secondValueShow='employeeName'
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'fullName', value: 'Name' }
                  ]}
                  maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    await setViewField(newValue?.recordId)
                    formik.setFieldValue('employeeRef', newValue?.reference || '')
                    formik.setFieldValue('employeeName', newValue?.fullName || '')
                    formik.setFieldValue('employeeId', newValue?.recordId || null)
                  }}
                  errorCheck={'employeeId'}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  name='department'
                  readOnly
                  label={labels.department}
                  secondFieldLabel={labels.department}
                  form={formik}
                  valueShow='departmentRef'
                  secondValueShow='departmentName'
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  name='reportTo'
                  readOnly
                  label={labels.reportTo}
                  secondFieldLabel={labels.reportTo}
                  form={formik}
                  valueShow='reportToRef'
                  secondValueShow='reportToName'
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  name='depManager'
                  readOnly
                  label={labels.depManager}
                  secondFieldLabel={labels.depManager}
                  form={formik}
                  valueShow='departmentHeadRef'
                  secondValueShow='departmentHeadName'
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name='position'
                  label={labels.empPosition}
                  value={formik.values.position}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name='schedule'
                  label={labels.schedule}
                  value={formik.values.schedule}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='leaveDate'
                  label={labels.dateOfLeave}
                  value={formik.values?.leaveDate}
                  required
                  readOnly={isClosed}
                  onBlur={(_, newValue) => {
                    formik.setFieldValue('leaveDate', newValue || null)
                  }}
                  onAccept={newValue => {
                    formik.setFieldValue('leaveDate', newValue || null)
                  }}
                  onClear={() => formik.setFieldValue('leaveDate', null)}
                  error={formik.touched.leaveDate && Boolean(formik.errors.leaveDate)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTimePicker
                  label={labels.from}
                  name='fromTime'
                  required
                  use24Hour
                  readOnly={isClosed}
                  value={formik.values.fromTime}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('fromTime', '')}
                  maxAccess={maxAccess}
                  error={formik.touched.fromTime && Boolean(formik.errors.fromTime)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTimePicker
                  label={labels.to}
                  name='toTime'
                  readOnly={isClosed}
                  use24Hour
                  required
                  value={formik.values.toTime}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('toTime', '')}
                  maxAccess={maxAccess}
                  error={formik.touched.toTime && Boolean(formik.errors.toTime)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='duration'
                  label={labels.leaveDuration}
                  value={formik.values.duration}
                  readOnly
                  required
                  maxAccess={maxAccess}
                  error={formik.touched.duration && Boolean(formik.errors.duration)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={TimeAttendanceRepository.DSLReason.qry}
                  name='reasonId'
                  label={labels.dsltype}
                  valueField='recordId'
                  displayField='name'
                  required
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('reasonId', newValue?.recordId || null)
                  }}
                  readOnly={isClosed}
                  maxAccess={maxAccess}
                  error={formik?.touched?.reasonId && Boolean(formik?.errors?.reasonId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTimePicker
                  label={labels.returnTime}
                  name='returnTime'
                  use24Hour
                  readOnly={isClosed}
                  value={formik.values.returnTime}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('returnTime', '')}
                  maxAccess={maxAccess}
                  error={formik.touched.returnTime && Boolean(formik.errors.returnTime)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='realDuration'
                  label={labels.duration}
                  value={formik.values.realDuration}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <CustomTextField
              name='destination'
              label={labels.destination}
              value={formik.values.destination}
              onChange={formik.handleChange}
              required
              maxLength={100}
              readOnly={isClosed}
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('destination', '')}
              error={formik.touched.destination && Boolean(formik.errors.destination)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='notes'
              label={labels.notes}
              value={formik.values.notes}
              rows={2}
              readOnly={isClosed}
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('notes', '')}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}


TaDslForm.width = 1000
TaDslForm.height = 500