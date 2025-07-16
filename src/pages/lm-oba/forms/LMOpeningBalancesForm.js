import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function LmObaForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.LeaveManagementFilters.page
  })

  const { formik } = useForm({
    initialValues: {
      fiscalYear: '',
      employeeId: '',
      lsId: '',
      days: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.string().required(),
      employeeId: yup.string().required(),
      lsId: yup.string().required(),
      days: yup.number().required().min(0).max(999)
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: LoanManagementRepository.LeaveManagementFilters.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) {
        formik.setFieldValue('recordId', response.recordId)
      }
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: LoanManagementRepository.LeaveManagementFilters.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res?.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LMOpeningBalances} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYear.qry}
                name='fiscalYear'
                label={labels.fiscalYear}
                values={formik.values}
                valueField='fiscalYear'
                displayField='fiscalYear'
                readOnly={editMode}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fiscalYear', newValue?.fiscalYear || '')
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='reference'
                displayField='fullName'
                name='employeeId'
                readOnly={editMode}
                label={labels.employee}
                form={formik}
                required
                displayFieldWidth={2}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('employeeId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('employeeName', newValue ? newValue.fullName : '')
                  formik.setFieldValue('employeeRef', newValue ? newValue.reference : '')
                }}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={LoanManagementRepository.LeaveScheduleFilters.qry}
                name='lsId'
                label={labels.leaveSchedule}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                readOnly={editMode}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('lsId', newValue?.recordId || '')
                }}
                error={formik.touched.lsId && Boolean(formik.errors.lsId)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomNumberField
                name='days'
                label={labels.days}
                value={formik.values.days}
                onChange={formik.handleChange}
                required
                maxLength={5}
                allowNegative={false}
                precision={2}
                maxAccess={maxAccess}
                error={formik.touched.days && Boolean(formik.errors.days)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
