import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grid } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { formatDateFromApi, formatDateTimeForGetAPI, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { SelfServiceRepository } from '@argus/repositories/src/repositories/SelfServiceRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'

export default function SSLeaveRequestForm({ recordId, labels, maxAccess }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)
  const employeeId = user?.employeeId

  const invalidate = useInvalidate({
    endpointId: SelfServiceRepository.SSLeaveRequest.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      startDate: new Date(),
      endDate: null,
      date: new Date(),
      employeeId,
      justification: '',
      reference: '',
      destination: '',
      ltId: null,
      isPaid: false,
      status: 1,
      leaveBalance: 0,
      multiDayLeave: 2,
      wip: 1
    },
    validationSchema: yup.object({
      date: yup.date().required(),
      employeeId: yup.number().required(),
      ltId: yup.number().required(),
      startDate: yup.date().required(),
      endDate: yup.date().required(),
      destination: yup.string().required()
    }),
    onSubmit: async values => {
      const payload = {
        ...values,
        date: formatDateToApi(values.date),
        startDate: formatDateToApi(values.startDate),
        endDate: formatDateToApi(values.endDate)
      }

      const res = await postRequest({
        extension: SelfServiceRepository.SSLeaveRequest.set,
        record: JSON.stringify(payload)
      })

      await refetchData(res.recordId)
      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

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

    const res2 = await getRequest({
      extension: LoanManagementRepository.Leaves.qry,
      parameters: `_recordId=${recordId}&_employeeId=${employeeId}&_lsId=${lsIdValue || 0}&_asOfDate=${
        asOfDate ? formatDateTimeForGetAPI(asOfDate) : formatDateTimeForGetAPI(new Date())
      }`
    })

    formik.setFieldValue('leaveBalance', res2?.list?.[0]?.summary?.balance ?? 0)
  }

  const refetchData = async recordId => {
    if (!recordId) return

    const res = await getRequest({
      extension: SelfServiceRepository.SSLeaveRequest.get,
      parameters: `_employeeId=${employeeId}&_leaveId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res.record.date),
      startDate: formatDateFromApi(res.record.startDate),
      endDate: formatDateFromApi(res.record.endDate)
    })
    await getLeaveBalance(recordId, res?.record?.employeeId, res?.record?.ltId, formatDateFromApi(res?.record?.date))
  }

  useEffect(() => {
    refetchData(recordId)

    const fetchEmployeeDetails = async () => {
      if (!employeeId) return

      const res = await getRequest({
        extension: EmployeeRepository.Employee.get1,
        parameters: `_recordId=${employeeId}`
      })

      formik.setFieldValue('employeeId', res?.record?.recordId)
      formik.setFieldValue('employeeRef', res?.record?.reference)
      formik.setFieldValue('employeeName', res?.record?.fullName)
    }

    if (!recordId) fetchEmployeeDetails()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.SSLeaveRequest}
      functionId={SystemFunction.LeaveRequest}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
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
                onChange={async (e, newValue) => {
                  await getLeaveBalance(recordId, formik?.values?.employeeId, formik?.values?.ltId, newValue)

                  formik.setFieldValue('date', newValue)
                }}
                required
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
                displayField='fullName'
                name='employeeRef'
                label={labels.employee}
                required
                readOnly
                secondValue={formik.values.employeeName}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
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
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('justification', '')}
                error={formik.touched.justification && Boolean(formik.errors.justification)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik.values?.startDate}
                max={formik.values.endDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.endDate}
                value={formik.values?.endDate}
                min={formik.values.startDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={LoanManagementRepository.IndemnityAccuralsFilters.qry}
                name='ltId'
                label={labels.leaveType}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={async (_, newValue) => {
                  formik.setFieldValue('leaveBalance', 0)
                  await getLeaveBalance(recordId, formik?.values?.employeeId, newValue?.recordId, formik.values.date)
                  formik.setFieldValue('ltId', newValue?.recordId || null)
                }}
                error={formik.touched.ltId && Boolean(formik.errors.ltId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='destination'
                label={labels.destination}
                value={formik.values?.destination}
                required
                maxLength={50}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('destination', '')}
                error={formik.touched.destination && Boolean(formik.errors.destination)}
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <ResourceComboBox
                name='status'
                label={labels.statusName}
                datasetId={DataSets.DOCUMENT_STATUS}
                values={formik.values}
                valueField='key'
                displayField='value'
                readOnly
                onChange={(event, newValue) => {
                  formik.setFieldValue('status', newValue?.key || null)
                }}
                error={formik.touched.status && Boolean(formik.errors.status)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
