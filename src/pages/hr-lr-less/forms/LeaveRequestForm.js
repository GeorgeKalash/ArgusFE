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
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

export default function LeaveRequestForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.LeaveRequest.page
  })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.LeaveRequest,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      startDate: null,
      endDate: null,
      date: new Date(),
      employeeId: null,
      justification: '',
      destination: '',
      ltId: null,
      status: 1,
      reference: '',
      hours: null,
      multiDayLeave: 1,
      wip: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      hours: yup.number().required(),
      startDate: yup.date().required(),
      date: yup.date().required(),
      destination: yup.string().required(),
      employeeId: yup.number().required(),
      ltId: yup.number().required(),
      justification: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: LoanManagementRepository.LeaveRequest.set,
        record: JSON.stringify({
          ...obj,
          date: formatDateToApi(obj.date),
          startDate: formatDateToApi(obj.startDate),
          endDate: formatDateToApi(obj.endDate)
        })
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response.recordId)
      invalidate()
    }
  })

  console.log(formik)
  const editMode = !!formik.values.recordId
  const isClosed = formik?.values?.wip === 2

  useEffect(() => {
    refetchForm(recordId)
  }, [])

  async function refetchForm(recordId) {
    if (recordId) {
      const { record } = await getRequest({
        extension: LoanManagementRepository.LeaveRequest.get,
        parameters: `_recordId=${recordId}`
      })
      formik.setValues({
        ...record,
        date: formatDateFromApi(record.date),
        startDate: formatDateFromApi(record.startDate),
        endDate: formatDateFromApi(record.endDate)
      })
    }
  }

  const onClose = async () => {
    await postRequest({
      extension: LoanManagementRepository.LeaveRequest.close,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        startDate: formatDateToApi(formik.values.startDate),
        endDate: formatDateToApi(formik.values.endDate)
      })
    })

    toast.success(platformLabels.Closed)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: LoanManagementRepository.LeaveRequest.reopen,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date),
        startDate: formatDateToApi(formik.values.startDate),
        endDate: formatDateToApi(formik.values.endDate)
      })
    })

    toast.success(platformLabels.Reopened)
    refetchForm(formik.values.recordId)
    invalidate()
  }

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
      disabled: !isClosed || !editMode || formik.values.releaseStatus === 3
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.LeaveRequest}
      previewReport
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.ref}
                value={formik.values.reference}
                maxAccess={maxAccess}
                maxLength='30'
                readOnly={isClosed}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
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
                label={labels.employee}
                secondFieldLabel={labels.employeeName}
                form={formik}
                readOnly={isClosed}
                displayFieldWidth={2}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
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
                label={labels.date}
                value={formik.values?.date}
                required
                readOnly={isClosed}
                onChange={(name, newValue) => {
                  formik.setFieldValue('date', newValue || null)
                }}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik.values?.startDate}
                required
                readOnly={isClosed}
                onChange={(name, newValue) => {
                  formik.setFieldValue('startDate', newValue || null)
                  formik.setFieldValue('endDate', newValue || null)
                }}
                onClear={() => {
                  formik.setFieldValue('startDate', null)
                  formik.setFieldValue('endDate', null)
                }}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='hours'
                label={labels.hours}
                value={formik.values.hours}
                maxAccess={maxAccess}
                readOnly={isClosed}
                required
                onChange={e => formik.setFieldValue('hours', e.target.value)}
                onClear={() => formik.setFieldValue('hours', null)}
                error={formik.touched.hours && Boolean(formik.errors.hours)}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='justification'
                label={labels.justification}
                value={formik.values.justification}
                rows={3}
                required
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('justification', '')}
                error={formik.touched.justification && Boolean(formik.errors.justification)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='destination'
                label={labels.destination}
                value={formik.values.destination}
                onChange={formik.handleChange}
                required
                readOnly={isClosed}
                maxLength={100}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('destination', '')}
                error={formik.touched.destination && Boolean(formik.errors.destination)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={LoanManagementRepository.IndemnityAccuralsFilters.qry}
                name='ltId'
                label={labels.leaveType}
                valueField='recordId'
                values={formik.values}
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik && formik.setFieldValue('ltId', newValue?.recordId)
                }}
                error={formik.touched.ltId && Boolean(formik.errors.ltId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
