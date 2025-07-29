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
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateForGetApI, formatDateFromApi } from 'src/lib/date-helper'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { createConditionalSchema } from 'src/lib/validation'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import CustomTimePicker from 'src/components/Inputs/CustomTimePicker'
import dayjs from 'dayjs'

export default function TaDslForm({ labels, access, recordId, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.Wax,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.Wax.page
  })

  const conditions = {
    jobId: row => row?.jobId,
    pieces: row => row?.jobId > 0 && row?.pieces <= row?.jobPcs
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      employeeId: null,
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
      positionName: '',
      departmentHeadName: '',
      departmentHeadRef: '',
      position: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      fromTime: yup
        .mixed()
        .required()
        .test('before-timeTo', 'test', function (value) {
          const { toTime } = this.parent
          if (!value || !toTime) return true

          return dayjs(value).isBefore(dayjs(toTime))
        }),
      toTime: yup
        .mixed()
        .required()
        .test('after-timeFrom', 'ee', function (value) {
          const { fromTime } = this.parent
          if (!value || !fromTime) return true

          return dayjs(value).isAfter(dayjs(fromTime))
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: TimeAttendanceRepository.FlatSchedule.set,
        record: JSON.stringify({ ...obj })
      })
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      refetchForm(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values?.recordId
  const isPosted = formik?.values?.status === 3
  const isClosed = formik?.values?.wip === 2

  const getHeaderData = async recordId => {
    if (!recordId) return

    const response = await getRequest({
      extension: FoundryRepository.Wax.get,
      parameters: `_recordId=${recordId}`
    })

    return {
      ...response?.record,
      date: formatDateFromApi(response?.record.date)
    }
  }

  const getMetalSetting = async (metalId, metalColorId) => {
    if (!metalId || !metalColorId) return

    const response = await getRequest({
      extension: FoundryRepository.MetalSettings.get,
      parameters: `_metalId=${metalId}&_metalColorId=${metalColorId}`
    })

    return response?.record
  }

  const onPost = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()
    window.close()
  }

  const onUnpost = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.unpost,
      record: JSON.stringify(formik.values.header)
    })

    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onClose = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.close,
      record: JSON.stringify(formik.values.header)
    })

    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: FoundryRepository.Wax.reopen,
      record: JSON.stringify(formik.values.header)
    })

    refetchForm(formik.values.recordId)
    invalidate()
  }

  async function refetchForm(recordId) {
    const { record } = await getRequest({
      extension: TimeAttendanceRepository.ShitLeave.get,
      parameters: `_recordId=${recordId}`
    })
    formik.setValues({ ...record })
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
      disabled: !isClosed || isPosted
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
    console.log(formik.values.leaveDate)
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

  const getDuration = (start, end) => {
    if (!start || !end) return
    console.log(start, end)

    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)

    const startDate = new Date(0, 0, 0, startH, startM)
    const endDate = new Date(0, 0, 0, endH, endM)

    let diff = (endDate - startDate) / (1000 * 60)
    if (diff < 0) diff += 24 * 60

    const hours = Math.floor(diff / 60)
    const minutes = diff % 60

    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.ShiftLeave}
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
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={labels.ref}
                  value={formik.values.reference}
                  maxAccess={maxAccess}
                  maxLength='30'
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
                  readOnly={isClosed}
                  label={labels.employee}
                  secondFieldLabel={labels.employee}
                  form={formik}
                  valueShow='employeeRef'
                  secondValueShow='employeeName'
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'fullName', value: 'Name' }
                  ]}
                  maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    if (newValue?.recordId) {
                      const { record } = await getRequest({
                        extension: EmployeeRepository.QuickView.get,
                        parameters: `_recordId=${newValue?.recordId}&_asOfDate=${formatDateForGetApI(
                          formik.values.date
                        )}`
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
                    formik.setFieldValue('employeeRef', newValue?.employeeRef || '')
                    formik.setFieldValue('employeeName', newValue?.fullName || '')
                    formik.setFieldValue('employeeId', newValue?.recordId || null)
                  }}
                  errorCheck={'employeeId'}
                />
              </Grid>

              <Grid item xs={12}>
                <ResourceLookup
                  valueField='reference'
                  displayField='fullName'
                  name='reportToId'
                  required
                  readOnly
                  label={labels.employee}
                  secondFieldLabel={labels.employee}
                  form={formik}
                  valueShow='reportToRef'
                  secondValueShow='reportToName'
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  valueField='reference'
                  displayField='fullName'
                  name='reportToId'
                  required
                  readOnly
                  label={labels.employee}
                  secondFieldLabel={labels.employee}
                  form={formik}
                  valueShow='departmentRef'
                  secondValueShow='departmentName'
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  valueField='reference'
                  displayField='fullName'
                  name='reportToId'
                  required
                  readOnly
                  label={labels.employee}
                  secondFieldLabel={labels.employee}
                  form={formik}
                  valueShow='departmentHeadRef'
                  secondValueShow='departmentHeadName'
                  maxAccess={maxAccess}
                />
              </Grid>

              <Grid item xs={6}>
                <CustomTextField
                  name='position'
                  label={labels.flName}
                  value={formik.values.position}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={6}></Grid>

              <Grid item xs={6}>
                <CustomTextField
                  name='schedule'
                  label={labels.flName}
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
                  label={labels.leaveDate}
                  value={formik.values?.birthDate}
                  onBlur={e => formik.setFieldValue('leaveDate', e.target.value)}
                  disabledDate={'>='}
                  onClear={() => formik.setFieldValue('leaveDate', null)}
                  error={formik.touched.leaveDate && Boolean(formik.errors.leaveDate)}
                  maxAccess={maxAccess}
                  readOnly={editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTimePicker
                  label={labels.fromTime}
                  name='fromTime'
                  required
                  use24Hour
                  value={formik.values.fromTime}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('fromTime', '')}
                  maxAccess={maxAccess}
                  error={formik.touched.fromTime && Boolean(formik.errors.fromTime)}
                  max={dayjs(formik.values.fromTime, 'HH:mm')}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTimePicker
                  label={labels.toTime}
                  name='toTime'
                  use24Hour
                  required
                  value={formik.values.toTime}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('toTime', '')}
                  maxAccess={maxAccess}
                  error={formik.touched.toTime && Boolean(formik.errors.toTime)}
                  min={dayjs(formik.values.toTime, 'HH:mm')}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='duration'
                  label={labels.duration}
                  value={getDuration(
                    dayjs(formik.values.fromTime).format('HH:mm'),
                    dayjs(formik.values.toTime).format('HH:mm')
                  )}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={TimeAttendanceRepository.DSLReason.qry}
                  name='reasonId'
                  label={labels.reason}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('reasonId', newValue?.recordId || null)
                  }}
                  maxAccess={maxAccess}
                  error={formik?.touched?.reasonId && Boolean(formik?.errors?.reasonId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTimePicker
                  label={labels.fromTime}
                  name='fromTime'
                  required
                  use24Hour
                  value={formik.values.fromTime}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('fromTime', '')}
                  maxAccess={maxAccess}
                  error={formik.touched.fromTime && Boolean(formik.errors.fromTime)}
                  max={dayjs(formik.values.fromTime, 'HH:mm')}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='realDuration'
                  label={labels.realDuration}
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
