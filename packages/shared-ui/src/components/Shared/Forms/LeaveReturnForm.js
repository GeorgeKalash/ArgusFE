import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

export default function LeaveReturnForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.LeaveReturn.page
  })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.LeaveReturn,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.title, window })


  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.ReturnFromLeave,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      date: null,
      employeeId: null,
      employeeRef: '',
      employeeName: '',
      justification: '',
      leaveId: null,
      status: 1,
      reference: '',
      returnType: null,
      wip: 1,
      minDate: null,
      maxDate: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup
        .date()
        .typeError()
        .required()
        .test(function (value) {
          const { minDate, maxDate } = this.parent

          if (!value) return true
          if (minDate && value <= new Date(minDate)) return false
          if (maxDate && value >= new Date(maxDate)) return false

          return true
        }),
      leaveId: yup.number().required(),
      returnType: yup.number().required(),
      justification: yup.string().required()
    }),
    onSubmit: async obj => {
      const { minDate, maxDate, employeeName, date, ...rest } = obj

      const response = await postRequest({
        extension: LoanManagementRepository.LeaveReturn.set,
        record: JSON.stringify({
          ...rest,
          date: formatDateToApi(date)
        })
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik?.values?.wip === 2

  useEffect(() => {
    refetchForm(recordId)
  }, [])

  async function refetchForm(recordId) {
    if (recordId) {
      const { record } = await getRequest({
        extension: LoanManagementRepository.LeaveReturn.get,
        parameters: `_recordId=${recordId}`
      })

      const obj = await fillDate(record.returnType, record.leaveId)
      formik.setValues({
        ...record,
        date: formatDateFromApi(record.date),
        minDate: obj.minDate,
        maxDate: obj.maxDate
      })
    }
  }

  const { minDate, maxDate, employeeName, date, ...rest } = formik.values

  const onClose = async () => {
    await postRequest({
      extension: LoanManagementRepository.LeaveReturn.close,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(date)
      })
    })

    toast.success(platformLabels.Closed)
    refetchForm(rest.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: LoanManagementRepository.LeaveReturn.reopen,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(date)
      })
    })

    toast.success(platformLabels.Reopened)
    refetchForm(rest.recordId)
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
      disabled: !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  async function fillDate(key, leaveId) {
    const obj = { date: null, minDate: null, maxDate: null }

    if (!leaveId || !key) return

    const { record } = await getRequest({
      extension: LoanManagementRepository.LeaveRequest.get,
      parameters: `_recordId=${leaveId}`
    })

    switch (key) {
      case '1':
        obj.date = formatDateFromApi(record.startDate)
        break

      case '2':
        obj.minDate = formatDateFromApi(record.startDate)
        obj.endDate = formatDateFromApi(record.endDate)
        obj.date = new Date()

        break

      case '3':
        const nextDay = new Date(formatDateFromApi(record.endDate))
        nextDay.setDate(nextDay.getDate() + 1)
        obj.date = nextDay

        break

      case '4':
        obj.date = new Date()
        obj.minDate = record.startDate

        break

      default:
        break
    }

    return obj
  }

  return (
    <FormShell
      resourceId={ResourceIds.LeaveReturn}
      functionId={SystemFunction.ReturnFromLeave}
      previewReport={editMode}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
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
              <ResourceComboBox
                endpointId={formik.values.employeeId && LoanManagementRepository.LeaveRequest.qry}
                parameters={`_filter=&_multiDayLeave=2&_params=1|${formik.values.employeeId}&_sortBy=recordId&_startAt=0&_size=100`}
                filter={item => item.status == 4}
                displayField={['reference', { name: 'startDate', type: 'date' }, { name: 'endDate', type: 'date' }]}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'startDate', value: 'Start Date', type: 'date' },
                  { key: 'endDate', value: 'End date', type: 'date' }
                ]}
                name='leaveId'
                label={labels.leave}
                valueField='recordId'
                required
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('leaveId', newValue?.recordId || null)
                }}
                readOnly={isClosed}
                maxAccess={maxAccess}
                error={formik?.touched?.leaveId && Boolean(formik?.errors?.leaveId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LEAVE_RETURN_TYPE}
                name='returnType'
                label={labels.returnType}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={async (event, newValue) => {
                  const obj = await fillDate(newValue?.key, formik.values.leaveId)

                  formik.setValues({
                    ...formik.values,
                    maxDate: obj?.maxDate || null,
                    minDate: obj?.minDate || null,
                    date: obj?.date || null,
                    returnType: newValue?.key || null
                  })
                }}
                error={formik.touched.returnType && Boolean(formik.errors.returnType)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                required
                readOnly={isClosed || formik.values.returnType == '1' || formik.values.returnType == '3'}
                onChange={(name, newValue) => {
                  formik.setFieldValue('date', newValue || null)
                }}
                min={formik.values.minDate}
                max={formik.values.maxDate}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
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
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

LeaveReturnForm.width = 800
LeaveReturnForm.height = 500
