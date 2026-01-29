import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

export default function EmpPenaltyForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.EmployeePenalties,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.empPenalty, window })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.Penalty,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: '',
      penaltyId: null,
      employeeId: null,
      employeeRef: '',
      employeeName: '',
      date: new Date(),
      amount: null,
      notes: '',
      status: 1,
      wip: 1
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup
        .date()
        .required()
        .test(function (value) {
          return value <= new Date()
        }),
      penaltyId: yup.number().required(),
      amount: yup.number().required(),
      employeeId: yup.number().required()
    }),
    onSubmit: async obj => {
      const { employeeName, employeeRef, date, ...rest } = obj

      const response = await postRequest({
        extension: EmployeeRepository.EmployeePenalty.set,
        record: JSON.stringify({ ...rest, date: formatDateToApi(date) })
      })

      toast.success(rest.recordId ? platformLabels.Edited : platformLabels.Added)
      refetchForm(response.recordId)

      invalidate()
    }
  })

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeePenalty.page
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  async function refetchForm(recordId) {
    if (recordId) {
      const { record } = await getRequest({
        extension: EmployeeRepository.EmployeePenalty.get,
        parameters: `_recordId=${recordId}`
      })
      formik.setValues({ ...record, date: formatDateFromApi(record.date) })
    }
  }

  useEffect(() => {
    refetchForm(recordId)
  }, [])

  const { employeeName, employeeRef, date, ...rest } = formik.values

  const onClose = async () => {
    await postRequest({
      extension: EmployeeRepository.EmployeePenalty.close,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(date)
      })
    })

    toast.success(platformLabels.Closed)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: EmployeeRepository.EmployeePenalty.reopen,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(date)
      })
    })

    toast.success(platformLabels.Reopened)
    refetchForm(formik.values.recordId)
    invalidate()
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
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

  return (
    <FormShell
      resourceId={ResourceIds.EmployeePenalties}
      functionId={SystemFunction.Penalty}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
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
                readOnly={editMode}
                maxLength='10'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values?.date}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
                readOnly={isClosed}
                max={new Date()}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PayrollRepository.PenaltyType.qry}
                name='penaltyId'
                label={labels.penalty}
                required
                valueField='recordId'
                readOnly={isClosed}
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('penaltyId', newValue?.recordId || null)
                }}
                error={formik.touched.penaltyId && Boolean(formik.errors.penaltyId)}
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
                secondFieldLabel={labels.empName}
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
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={formik.values.amount}
                maxAccess={maxAccess}
                readOnly={isClosed}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('amount', null)}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={3}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

EmpPenaltyForm.width = 600
EmpPenaltyForm.height = 470
