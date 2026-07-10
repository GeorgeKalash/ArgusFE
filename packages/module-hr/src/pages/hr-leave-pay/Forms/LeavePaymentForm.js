import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { LeaveManagementRepository } from '@argus/repositories/src/repositories/LeaveManagementRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import { roundTo } from '@argus/shared-domain/src/lib/numberField-helper'

export default function LeavePaymentForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)

  const [trackByHours, setTrackByHours] = useState(false)

  const monthWorkHrs = parseFloat(systemDefaults?.list?.find(({ key }) => key === 'monthWorkHrs')?.value || 0)
  const dayWorkHrs = parseFloat(systemDefaults?.list?.find(({ key }) => key === 'dayWorkHrs')?.value || 0)

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.LeavePayment.page
  })

  const initialValues = {
    recordId: recordId || null,
    paymentRef: '',
    date: new Date(),
    employeeId: null,
    employeeName: '',
    effectiveDate: new Date(),
    lsId: null,
    lsName: '',
    ltId: null,
    ltName: '',
    departmentId: null,
    salary: 0,
    hours: 0,
    days: 0,
    amount: 0,
    hireDate: '',
    serviceDuration: '',
    departmentName: '',
    positionName: '',
    branchName: '',
    nationality: '',
    loanBalance: 0,
    summary: {
      leaveTrackTime: null,
      lttName: '',
      leaveType: '',
      previousBalance: 0,
      earned: 0,
      used: 0,
      carryOverDeducted: 0,
      adjustments: 0,
      payments: 0,
      balance: 0
    }
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validationSchema: yup.object({
      date: yup.date().required(),
      effectiveDate: yup.date().required(),
      employeeId: yup.number().required(),
      lsId: yup.number().required(),
      ltId: yup.number().required(),
      days: yup
        .number()
        .nullable()
        .test('days-max', 'Days cannot exceed leave balance', function (value) {
          const { summary } = this.parent
          if (value == null) return true

          return value <= (summary?.balance ?? 0)
        }),
      hours: yup
        .number()
        .nullable()
        .test('hours-max', 'Hours cannot exceed leave balance', function (value) {
          const { summary } = this.parent
          if (value == null) return true

          return value <= (summary?.balance ?? 0)
        })
    }),
    onSubmit: handleSubmit
  })

  async function handleSubmit(obj) {
    const payload = {
      ...obj,
      date: formatDateToApi(obj.date),
      effectiveDate: formatDateToApi(obj.effectiveDate),
      summary: {
        leaveTrackTime: obj.summary?.leaveTrackTime ?? null,
        lttName: obj.summary?.lttName || '',
        leaveType: obj.ltName || obj.summary?.leaveType || '',
        previousBalance: obj.summary?.previousBalance || 0,
        earned: obj.summary?.earned || 0,
        used: obj.summary?.used || 0,
        carryOverDeducted: obj.summary?.carryOverDeducted || 0,
        adjustments: obj.summary?.adjustments || 0,
        payments: obj.summary?.payments || 0,
        balance: obj.summary?.balance || 0
      }
    }

    const response = await postRequest({
      extension: PayrollRepository.LeavePayment.set,
      record: JSON.stringify(payload)
    })

    if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
    toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
    invalidate()
  }

  const editMode = !!formik.values.recordId

  async function fetchLeaveScheduleAndType(lsId) {
    if (!lsId) {
      setTrackByHours(false)

      return null
    }

    const lsRes = await getRequest({
      extension: LeaveManagementRepository.LeaveScheduleFilters.get,
      parameters: `_recordId=${lsId}`
    })

    const ltId = lsRes?.record?.ltId || null
    formik.setFieldValue('ltId', ltId)

    if (!ltId) {
      formik.setFieldValue('ltName', '')
      setTrackByHours(false)

      return null
    }

    const ltRes = await getRequest({
      extension: LeaveManagementRepository.LeaveTypes.get,
      parameters: `_recordId=${ltId}`
    })

    const ltName = ltRes?.record?.name || ''
    const tracksByHours = ltRes?.record?.leaveTrackTime === 1

    formik.setFieldValue('ltName', ltName)
    formik.setFieldValue('summary.leaveType', ltName)
    setTrackByHours(tracksByHours)

    return { ltId, ltName, tracksByHours }
  }

  async function fetchEmployeeQuickView(employeeId, effectiveDate) {
    if (!employeeId || !effectiveDate) return

    const res = await getRequest({
      extension: EmployeeRepository.QuickView.get,
      parameters: `_recordId=${employeeId}&_asOfDate=${formatDateForGetApI(effectiveDate)}`
    })

    formik.setFieldValue('hireDate', res?.record?.hireDate ? formatDateFromApi(res?.record?.hireDate) : '')
    formik.setFieldValue('serviceDuration', res?.record?.serviceDuration || '')
    formik.setFieldValue('departmentId', res?.record?.departmentId || null)
    formik.setFieldValue('departmentName', res?.record?.departmentName || '')
    formik.setFieldValue('positionName', res?.record?.positionName || '')
    formik.setFieldValue('branchName', res?.record?.branchName || '')
    formik.setFieldValue('nationality', res?.record?.countryName || '')
    formik.setFieldValue('loanBalance', res?.record?.loanBalance || 0)
    formik.setFieldValue('salary', res?.record?.salary || 0)
  }

  async function fillLeaveBalances(employeeId, lsId, effectiveDate, ltNameOverride) {
    if (!employeeId || !lsId || !effectiveDate) return

    const asOfDay = new Date(effectiveDate)
    asOfDay.setDate(asOfDay.getDate() - 1)

    const res = await getRequest({
      extension: LeaveManagementRepository.Leaves.qry,
      parameters: `_employeeId=${employeeId}&_lsId=${lsId}&_asOfDate=${formatDateForGetApI(asOfDay)}`
    })

    const list = res?.list || []
    const items = list[list.length - 1] || {}
    const summary = items.summary || {}

    formik.setFieldValue('summary', {
      leaveTrackTime: summary.leaveTrackTime ?? null,
      lttName: summary.lttName || '',
      leaveType: summary.leaveType || ltNameOverride || formik.values.ltName || '',
      previousBalance: roundTo(summary.previousBalance),
      earned: roundTo(summary.earned),
      used: roundTo(summary.used),
      carryOverDeducted: roundTo(summary.carryOverDeducted),
      adjustments: roundTo(summary.adjustments),
      payments: roundTo(summary.payments),
      balance: roundTo(summary.balance)
    })
  }

  function recalcFromDays(days, salary) {
    if (!monthWorkHrs || !dayWorkHrs) return
    const d = parseFloat(days) || 0
    const s = parseFloat(salary) || 0
    const hours = d * dayWorkHrs
    const amount = (s / monthWorkHrs) * dayWorkHrs * d
    formik.setFieldValue('hours', parseFloat(hours.toFixed(2)))
    formik.setFieldValue('amount', parseFloat(amount.toFixed(2)))
  }

  function recalcFromHours(hours, salary) {
    if (!monthWorkHrs) return
    const h = parseFloat(hours) || 0
    const s = parseFloat(salary) || 0
    const amount = (s / monthWorkHrs) * h
    formik.setFieldValue('amount', parseFloat(amount.toFixed(2)))
  }

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) return

      const res = await getRequest({
        extension: PayrollRepository.LeavePayment.get,
        parameters: `_recordId=${recordId}`
      })

      const record = res?.record || {}
      const effDate = formatDateFromApi(record.effectiveDate)

      formik.setValues({
        ...initialValues,
        ...record,
        date: formatDateFromApi(record.date),
        effectiveDate: effDate,
        summary: {
          ...initialValues.summary,
          ...(record.summary || {})
        }
      })

      const [ltInfo] = await Promise.all([
        fetchLeaveScheduleAndType(record.lsId),
        fetchEmployeeQuickView(record.employeeId, effDate)
      ])

      await fillLeaveBalances(record.employeeId, record.lsId, effDate, ltInfo?.ltName)
    }
    fetchRecord()
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.LeavePayment}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='paymentRef'
                    label={labels.reference}
                    value={formik.values.paymentRef}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik.values.date}
                    required
                    maxAccess={maxAccess}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={EmployeeRepository.Employee.snapshot}
                    parameters={{ _startAt: 0, _branchId: 0 }}
                    name='employeeId'
                    label={labels.employeeName}
                    valueField='reference'
                    displayField='fullName'
                    valueShow='employeeRef'
                    secondValueShow='employeeName'
                    form={formik}
                    required
                    maxAccess={maxAccess}
                    displayFieldWidth={2}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'fullName', value: 'Name' }
                    ]}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('employeeId', newValue?.recordId || null)
                      formik.setFieldValue('employeeName', newValue?.fullName || '')
                      formik.setFieldValue('employeeRef', newValue?.reference || '')
                      formik.setFieldValue('salary', newValue?.salary || 0)
                      formik.setFieldValue('hireDate', newValue?.hireDate || '')
                      formik.setFieldValue('serviceDuration', newValue?.serviceDuration || '')
                      formik.setFieldValue('departmentId', newValue?.departmentId || null)
                      formik.setFieldValue('departmentName', newValue?.departmentName || '')
                      formik.setFieldValue('positionName', newValue?.positionName || '')
                      formik.setFieldValue('branchName', newValue?.branchName || '')
                      formik.setFieldValue('nationality', newValue?.nationality || '')
                      formik.setFieldValue('hours', 0)
                      formik.setFieldValue('amount', 0)

                      await fetchEmployeeQuickView(newValue?.recordId, formik.values.effectiveDate)

                      await fillLeaveBalances(newValue?.recordId, formik.values.lsId, formik.values.effectiveDate)
                    }}
                    error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='effectiveDate'
                    label={labels.effectiveDate}
                    value={formik.values.effectiveDate}
                    required
                    maxAccess={maxAccess}
                    onChange={async (name, value) => {
                      formik.setFieldValue(name, value)
                      formik.setFieldValue('hours', 0)
                      formik.setFieldValue('amount', 0)

                      await fetchEmployeeQuickView(formik.values.employeeId, value)
                      await fillLeaveBalances(formik.values.employeeId, formik.values.lsId, value)
                    }}
                    onClear={() => formik.setFieldValue('effectiveDate', null)}
                    error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={LeaveManagementRepository.LeaveScheduleFilters.qry}
                    name='lsId'
                    label={labels.leaveSchedule}
                    valueField='recordId'
                    displayField='name'
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={async (_, newValue) => {
                      formik.setFieldValue('lsId', newValue?.recordId || null)
                      formik.setFieldValue('lsName', newValue?.name || '')
                      formik.setFieldValue('ltId', null)
                      formik.setFieldValue('ltName', '')
                      formik.setFieldValue('days', 0)
                      formik.setFieldValue('hours', 0)
                      formik.setFieldValue('amount', 0)

                      const ltInfo = await fetchLeaveScheduleAndType(newValue?.recordId)

                      await fillLeaveBalances(
                        formik.values.employeeId,
                        newValue?.recordId,
                        formik.values.effectiveDate,
                        ltInfo?.ltName
                      )
                    }}
                    error={formik.touched.lsId && Boolean(formik.errors.lsId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='summary.balance'
                    label={labels.leaveBalance}
                    value={formik.values.summary.balance}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='salary'
                    label={labels.salary}
                    value={formik.values.salary}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='hours'
                    label={labels.hours}
                    value={formik.values.hours}
                    maxAccess={maxAccess}
                    readOnly={!trackByHours}
                    decimalScale={2}
                    onChange={e => {
                      const hours = e.target.value
                      formik.setFieldValue('hours', hours)
                      recalcFromHours(hours, formik.values.salary)
                    }}
                    onClear={() => {
                      formik.setFieldValue('hours', 0)
                      formik.setFieldValue('amount', 0)
                    }}
                    error={formik.touched.hours && Boolean(formik.errors.hours)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='days'
                    label={labels.days}
                    value={formik.values.days}
                    maxAccess={maxAccess}
                    readOnly={trackByHours}
                    decimalScale={2}
                    onChange={e => {
                      const days = e.target.value
                      formik.setFieldValue('days', days)
                      recalcFromDays(days, formik.values.salary)
                    }}
                    onClear={() => {
                      formik.setFieldValue('days', 0)
                      formik.setFieldValue('hours', 0)
                      formik.setFieldValue('amount', 0)
                    }}
                    error={formik.touched.days && Boolean(formik.errors.days)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='amount'
                    label={labels.netToPay}
                    value={formik.values.amount}
                    maxAccess={maxAccess}
                    readOnly
                    decimalScale={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='hireDate'
                    label={labels.hireDate}
                    value={formik.values.hireDate}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='serviceDuration'
                    label={labels.serviceDuration}
                    value={formik.values.serviceDuration}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='departmentName'
                    label={labels.department}
                    value={formik.values.departmentName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='positionName'
                    label={labels.position}
                    value={formik.values.positionName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='branchName'
                    label={labels.branch}
                    value={formik.values.branchName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='nationality'
                    label={labels.nationality}
                    value={formik.values.nationality}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='loanBalance'
                    label={labels.loanBalance}
                    value={formik.values.loanBalance}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='summary.earned'
                    label={labels.earned}
                    value={formik.values.summary.earned}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='summary.used'
                    label={labels.used}
                    value={formik.values.summary.used}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='summary.carryOverDeducted'
                    label={labels.carryOverDeducted}
                    value={formik.values.summary.carryOverDeducted}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='summary.adjustments'
                    label={labels.adjustments}
                    value={formik.values.summary.adjustments}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='summary.payments'
                    label={labels.payments}
                    value={formik.values.summary.payments}
                    maxAccess={maxAccess}
                    readOnly
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