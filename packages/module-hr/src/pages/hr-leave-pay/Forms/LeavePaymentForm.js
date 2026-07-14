import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
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
    ltId: null,
    trackByHours: false,
    salary: 0,
    hours: 0,
    days: 0,
    amount: 0,
    hireDate: null,
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
        .test('days-validation', 'Days must be greater than 0 and cannot exceed leave balance', function (value) {
          const { summary, trackByHours } = this.parent

          if (trackByHours || value == null) return true

          return value > 0 && value <= (summary?.balance ?? 0)
        }),
      hours: yup
        .number()
        .nullable()
        .test('hours-validation', 'Hours must be greater than 0 and cannot exceed leave balance', function (value) {
          const { summary } = this.parent
          if (value == null) return true

          return value > 0 && value <= (summary?.balance ?? 0)
        }),
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
        leaveType: obj.summary?.leaveType || '',
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
    if (!lsId) return { trackByHours: false }

    const lsRes = await getRequest({
      extension: LeaveManagementRepository.LeaveScheduleFilters.get,
      parameters: `_recordId=${lsId}`
    })

    const ltId = lsRes?.record?.ltId || null

    if (!ltId) return { ltId: null, trackByHours: false }

    const ltRes = await getRequest({
      extension: LeaveManagementRepository.LeaveTypes.get,
      parameters: `_recordId=${ltId}`
    })

    const ltName = ltRes?.record?.name || ''
    const trackByHours = ltRes?.record?.leaveTrackTime === 1

    return { ltId, ltName, trackByHours }
  }

  async function fetchEmployeeQuickView(employeeId, effectiveDate) {
    if (!employeeId || !effectiveDate) return { loanBalance: 0 }

    const res = await getRequest({
      extension: EmployeeRepository.QuickView.get,
      parameters: `_recordId=${employeeId}&_asOfDate=${formatDateForGetApI(effectiveDate)}`
    })

    const record = res?.record

    return {
      hireDate: record?.hireDate ? formatDateFromApi(record?.hireDate) : null,
      serviceDuration: record?.serviceDuration || '',
      departmentId: record?.departmentId || null,
      departmentName: record?.departmentName || '',
      positionName: record?.positionName || '',
      branchName: record?.branchName || '',
      nationality: record?.countryName || '',
      loanBalance: record?.loanBalance || 0,
      salary: record?.salary || 0
    }
  }

  async function fillLeaveBalances(employeeId, lsId, effectiveDate, ltNameOverride) {
    if (!employeeId || !lsId || !effectiveDate) {
      return { earned: 0, used: 0, carryOverDeducted: 0, adjustments: 0, payments: 0 }
    }

    const asOfDay = new Date(effectiveDate)
    asOfDay.setDate(asOfDay.getDate() - 1)

    const res = await getRequest({
      extension: LeaveManagementRepository.Leaves.qry,
      parameters: `_employeeId=${employeeId}&_lsId=${lsId}&_asOfDate=${formatDateForGetApI(asOfDay)}`
    })

    const list = res?.list || []

    const totals = list.reduce(
      (acc, item) => {
        const s = item.summary || {}
        acc.previousBalance += s.previousBalance || 0
        acc.earned += s.earned || 0
        acc.used += s.used || 0
        acc.carryOverDeducted += s.carryOverDeducted || 0
        acc.adjustments += s.adjustments || 0
        acc.payments += s.payments || 0
        acc.balance += s.balance || 0

        return acc
      },
      { previousBalance: 0, earned: 0, used: 0, carryOverDeducted: 0, adjustments: 0, payments: 0, balance: 0 }
    )

    const summary = list.slice(-1)[0]?.summary || {}

    return {
      leaveTrackTime: summary.leaveTrackTime ?? null,
      lttName: summary.lttName || '',
      leaveType: summary.leaveType || ltNameOverride || '',
      previousBalance: roundTo(totals.previousBalance),
      earned: roundTo(totals.earned),
      used: roundTo(totals.used),
      carryOverDeducted: roundTo(totals.carryOverDeducted),
      adjustments: roundTo(totals.adjustments),
      payments: roundTo(totals.payments),
      balance: roundTo(totals.balance)
    }
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

      const [ltInfo, employeeQuickView] = await Promise.all([
        fetchLeaveScheduleAndType(record.lsId),
        fetchEmployeeQuickView(record.employeeId, effDate)
      ])

      const summary = await fillLeaveBalances(record.employeeId, record.lsId, effDate, ltInfo?.ltName)

      formik.setValues({
        ...record,
        date: formatDateFromApi(record.date),
        effectiveDate: effDate,
        ...ltInfo,
        ...employeeQuickView,
        summary: { ...(record.summary || {}), ...summary }
      })
    }
    fetchRecord()
  }, [])

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
                      const employeeId = newValue?.recordId || null

                      const employeeQuickView = await fetchEmployeeQuickView(employeeId, formik.values.effectiveDate)

                      const summary = await fillLeaveBalances(employeeId, formik.values.lsId, formik.values.effectiveDate)

                      formik.setValues({
                        ...formik.values,
                        employeeId,
                        employeeName: newValue?.fullName || '',
                        employeeRef: newValue?.reference || '',
                        hours: 0,
                        amount: 0,
                        ...employeeQuickView,
                        summary: { ...formik.values.summary, ...summary }
                      })
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
                    onChange={async (_, value) => {
                      const [employeeQuickView, summary] = await Promise.all([
                        fetchEmployeeQuickView(formik.values.employeeId, value),
                        fillLeaveBalances(formik.values.employeeId, formik.values.lsId, value)
                      ])

                      formik.setValues({
                        ...formik.values,
                        effectiveDate: value,
                        hours: 0,
                        amount: 0,
                        ...employeeQuickView,
                        summary: { ...formik.values.summary, ...summary }
                      })
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
                    defaultIndex={0}
                    maxAccess={maxAccess}
                    onChange={async (_, newValue) => {
                      const lsId = newValue?.recordId || null

                      const ltInfo = await fetchLeaveScheduleAndType(lsId)
                      const summary = await fillLeaveBalances(formik.values.employeeId, lsId, formik.values.effectiveDate, ltInfo.ltName)

                      formik.setValues({
                        ...formik.values,
                        lsId,
                        ...ltInfo,
                        days: 0,
                        hours: 0,
                        amount: 0,
                        summary: { ...formik.values.summary, ...summary }
                      })
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
                    readOnly={!formik.values.trackByHours}
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
                    readOnly={formik.values.trackByHours}
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