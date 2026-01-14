import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { format } from 'date-fns'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import CustomDatePicker from '../Inputs/CustomDatePicker'
import { ResourceLookup } from './ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import FormShell from './FormShell'
import { formatDateFromApi, formatDateTimeForGetAPI, formatDayId } from '@argus/shared-domain/src/lib/date-helper'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import CustomNumberField from '../Inputs/CustomNumberField'
import dayjs from 'dayjs'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { DataGrid } from './DataGrid'
import { useError } from '@argus/shared-providers/src/providers/error'

export const LeaveForm = ({ recordId, window }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack: stackError } = useError()
  const editMode = !!recordId

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.LeaveRequestODOM,
    editMode
  })

  useSetWindow({ title: platformLabels.LeaveRequestODOM, window })

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.LeaveRequest.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      startDate: new Date(),
      endDate: new Date(),
      date: new Date(),
      employeeId: null,
      justification: '',
      reference: '',
      destination: '',
      ltId: null,
      isPaid: false,
      status: 1,
      employeeName: '',
      hours: null,
      leaveDays: null,
      leaveBalance: 0,
      multiDayLeave: 2,
      wip: 1,
      items: []
    },
    validationSchema: yup.object({
      date: yup.date().required(),
      employeeId: yup.number().required(),
      ltId: yup.number().required(),
      startDate: yup.date().required(),
      endDate: yup.date().required(),
      destination: yup.string().required(),
      items: yup.array().of(
        yup.object({
          dayId: yup.string().nullable(),
          hours: yup
            .number()
            .nullable()
            .typeError()
            .min(0)
            .test('hours-not-greater-than-scheduled', 'Hours cannot be greater than scheduled hours', function (value) {
              const { scheduledHours } = this.parent
              if (value == null || scheduledHours == null) return true

              return value <= scheduledHours
            })
        })
      )
    }),
    onSubmit: async values => {
      const { items, ...rest } = values

      const payload = {
        leave: {
          ...rest
        },
        leaveDays:
          items.map(item => ({
            ...item,
            leaveId: !values.recordId ? 0 : values.recordId,
            dayId: dayjs(new Date(item.dayId)).format('YYYYMMDD')
          })) || []
      }

      const res = await postRequest({
        extension: LoanManagementRepository.LeaveRequest.set2,
        record: JSON.stringify(payload)
      })

      await refetchData(res.recordId)
      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })

  const getLeaveBalance = async (recordId, employeeId, ltId, asOfDate) => {
    if (!employeeId || !ltId) {
      formik.setFieldValue('leaveBalance', 0)

      return
    }

    const res = await getRequest({
      extension: EmployeeRepository.Leaves.get,
      parameters: `_ltId=${ltId}&_employeeId=${employeeId}`
    })

    const lsIdValue = res?.record?.lsId
    if (!lsIdValue) {
      formik.setFieldValue('leaveBalance', 0)

      return
    }

    const res2 = await getRequest({
      extension: LoanManagementRepository.Leaves.qry,
      parameters: `_recordId=${recordId}&_employeeId=${employeeId}&_lsId=${lsIdValue}&_asOfDate=${
        asOfDate ? formatDateTimeForGetAPI(asOfDate) : formatDateTimeForGetAPI(new Date())
      }`
    })

    formik.setFieldValue('leaveBalance', res2?.list?.[0]?.summary?.balance ?? 0)
  }

  const isClosed = formik.values.wip == 2

  const columns = [
    {
      component: 'textfield',
      label: labels.date,
      name: 'dayId',
      props: { readOnly: true },
      flex: 2
    },
    {
      component: 'textfield',
      label: labels.leaveDayType,
      name: 'ldtName',
      props: { readOnly: true },
      flex: 1.5
    },
    {
      component: 'numberfield',
      label: labels.hours,
      name: 'hours',
      flex: 1,
      props: {
        maxLength: 12,
        decimalScale: 2
      }
    }
  ]

  const refetchData = async recordId => {
    if (!recordId) return

    const res = await getRequest({
      extension: LoanManagementRepository.LeaveRequest.get2,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record.leave,
      date: res.record.leave.date ? formatDateFromApi(res.record.leave.date) : null,
      startDate: res.record.leave.startDate ? formatDateFromApi(res.record.leave.startDate) : null,
      endDate: res.record.leave.endDate ? formatDateFromApi(res.record.leave.endDate) : null,
      items:
        res.record.leaveDays.map((day, index) => ({
          ...day,
          dayId: formatDayId(day.dayId),
          id: index
        })) || []
    })

    getLeaveBalance(
      recordId,
      res?.record?.leave?.employeeId,
      res?.record?.leave?.ltId,
      formatDateFromApi(res?.record?.leave?.date)
    )
  }

  const onClose = async () => {
    const { items, ...rest } = formik.values

    const res = await postRequest({
      extension: LoanManagementRepository.LeaveRequest.close,
      record: JSON.stringify(rest)
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchData(res.recordId)
  }

  const onReopen = async () => {
    const { items, ...rest } = formik.values

    const res = await postRequest({
      extension: LoanManagementRepository.LeaveRequest.reopen,
      record: JSON.stringify(rest)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchData(res.recordId)
  }

  async function onValidationRequired() {
    if (Object.keys(await formik.validateForm()).length) {
      const errors = await formik.validateForm()

      const touchedFields = Object.keys(errors).reduce((acc, key) => {
        if (!formik.touched[key]) {
          acc[key] = true
        }

        return acc
      }, {})

      if (Object.keys(touchedFields).length) {
        formik.setTouched(touchedFields, true)
      }
    }
  }

  const calculateLeaveTotals = items => {
    let totalHours = 0
    let totalDays = 0

    items.forEach(row => {
      const hours = parseFloat(row.hours) || 0
      const scheduled = parseFloat(row.scheduledHours) || 0

      totalHours += hours

      if (scheduled > 0) {
        const ratio = hours / scheduled

        if (!isNaN(ratio)) {
          totalDays += ratio
        }
      }
    })

    return { totalHours, totalDays }
  }

  const onPreview = async () => {
    const { startDate, endDate, employeeId, ltId } = formik.values

    const fromDayId = format(new Date(startDate), 'yyyyMMdd')
    const toDayId = format(new Date(endDate), 'yyyyMMdd')

    if (!employeeId || !ltId || !fromDayId || !toDayId) {
      await onValidationRequired()

      return
    }

    const diffInYears = dayjs(endDate).diff(dayjs(startDate), 'year', true)
    if (diffInYears > 1) {
      stackError({
        message: labels.cannotExceedOneYear
      })
      
      return
    }

    const res = await getRequest({
      extension: LoanManagementRepository.PreviewDays.preview,
      parameters: `_filter=&_size=30&_startAt=0&_employeeId=${formik.values.employeeId}&_ltId=${formik.values.ltId}&_fromDayId=${fromDayId}&_toDayId=${toDayId}`
    })

    if (res?.list) {
      formik.setFieldValue(
        'items',
        res.list.map((day, index) => ({
          ...day,
          dayId: formatDayId(day.dayId),
          id: index + 1
        }))
      )

      const { totalHours, totalDays } = calculateLeaveTotals(res.list)

      formik.setFieldValue('hours', totalHours)
      formik.setFieldValue('leaveDays', totalDays)
    } else {
      formik.setFieldValue('items', [])
      formik.setFieldValue('hours', null)
      formik.setFieldValue('leaveDays', null)
    }
  }

  useEffect(() => {
    ;(async function () {
      if (editMode) await onPreview()
      refetchData(recordId)
    })()
  }, [])

  useEffect(() => {
    const { totalHours, totalDays } = calculateLeaveTotals(formik.values.items)
    formik.setFieldValue('hours', totalHours)
    formik.setFieldValue('leaveDays', totalDays)
  }, [formik.values.items])

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
    },
    {
      key: 'Preview',
      condition: true,
      onClick: onPreview
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.LeaveRequestODOM}
      functionId={SystemFunction.LeaveRequest}
      actions={actions}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      disabledSubmit={formik.values.items.length === 0 || isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values?.reference}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                readOnly={isClosed}
                onChange={async (e, newValue) => {
                  formik.setFieldValue('date', newValue)
                  await getLeaveBalance(recordId, formik?.values?.employeeId, formik?.values?.ltId, newValue)
                }}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                form={formik}
                maxAccess={maxAccess}
                valueField='reference'
                readOnly={isClosed}
                displayField='fullName'
                name='employeeRef'
                label={labels.employee}
                required
                secondValue={formik.values.employeeName}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                  await getLeaveBalance(recordId, newValue?.recordId, formik?.values?.ltId, formik.values.date)
                }}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='justification'
                label={labels.justification}
                value={formik.values?.justification}
                maxLength={512}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('justification', '')}
                error={formik.touched.justification && Boolean(formik.errors.justification)}
              />
            </Grid>

            <Grid
              item
              xs={6}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                paddingTop: 3,
                overflowY: 'auto'
              }}
            >
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik.values?.startDate}
                max={formik.values.endDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                maxAccess={maxAccess}
                readOnly={isClosed}
              />
              <CustomDatePicker
                name='endDate'
                label={labels.endDate}
                value={formik.values?.endDate}
                min={formik.values.startDate}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                maxAccess={maxAccess}
                readOnly={isClosed}
              />
              <ResourceComboBox
                endpointId={LoanManagementRepository.IndemnityAccuralsFilters.qry}
                name='ltId'
                label={labels.leaveType}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                readOnly={isClosed}
                required
                onChange={async (_, newValue) => {
                  formik.setFieldValue('hours', 0)
                  formik.setFieldValue('leaveBalance', 0)
                  formik.setFieldValue('leaveDays', 0)
                  await getLeaveBalance(recordId, formik?.values?.employeeId, newValue?.recordId, formik.values.date)
                  formik.setFieldValue('ltId', newValue?.recordId || null)
                }}
                error={formik.touched.ltId && Boolean(formik.errors.ltId)}
              />
              <CustomTextField
                name='destination'
                label={labels.destination}
                value={formik.values?.destination}
                required
                readOnly={isClosed}
                maxLength={50}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('destination', '')}
                error={formik.touched.destination && Boolean(formik.errors.destination)}
              />
              <CustomNumberField
                name='leaveBalance'
                label={labels.leaveBalance}
                value={formik.values.leaveBalance}
                readOnly
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('leaveBalance', null)}
                error={formik.touched.leaveBalance && Boolean(formik.errors.leaveBalance)}
              />
            </Grid>

            <Grid
              item
              xs={6}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '70%',
                overflow: 'hidden'
              }}
            >
              <DataGrid
                name='items'
                onChange={value => formik.setFieldValue('items', value)}
                value={formik.values.items}
                error={formik.errors.items}
                columns={columns}
                allowDelete={false}
                allowAddNewLine={false}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='hours'
                label={labels.hours}
                value={formik.values.hours}
                readOnly
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('hours', null)}
                error={formik.touched.hours && Boolean(formik.errors.hours)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='leaveDays'
                label={labels.leaveDays}
                value={formik.values.leaveDays}
                readOnly
                maxAccess={maxAccess}
                decimalScale={3}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('leaveDays', null)}
                error={formik.touched.leaveDays && Boolean(formik.errors.leaveDays)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

LeaveForm.width = 1000
LeaveForm.height = 650
