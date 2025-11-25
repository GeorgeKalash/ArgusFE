import { useContext } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ImportExportMode } from '../index'

export default function ImportExportRangeForm({ mode, labels, maxAccess, values, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const isExport = mode === ImportExportMode.EXPORT

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      fromEmployeeId: isExport ? values.employeeId : null,
      fromEmployeeRef: isExport ? values.employeeRef : null,
      fromEmployeeName: isExport ? values.employeeName : null,
      toEmployeeId: !isExport ? values.employeeId : null,
      toEmployeeRef: !isExport ? values.employeeRef : null,
      toEmployeeName: !isExport ? values.employeeName : null,
      startDate: null,
      endDate: null
    },
    validationSchema: yup.object({
      fromEmployeeId: yup.number().required(),
      toEmployeeId: yup.number().required(),
      startDate: yup.date().required(),
      endDate: yup.date().required()
    }),
    onSubmit: async values => {
      const payload = {
        fromEmployeeId: values.fromEmployeeId,
        toEmployeeId: values.toEmployeeId,
        startDate: values.startDate,
        endDate: values.endDate
      }

      await postRequest({
        extension: TimeAttendanceRepository.FlatSchedule.copyRange,
        record: JSON.stringify(payload)
      })
      toast.success(`${!isExport ? platformLabels.Imported : platformLabels.Exported}`)
      window.close()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                form={formik}
                valueField='reference'
                displayField='fullName'
                name='fromEmployeeRef'
                label={labels.fromEmployee}
                valueShow='fromEmployeeRef'
                secondValueShow='fromEmployeeName'
                displayFieldWidth={2}
                readOnly={isExport}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('fromEmployeeRef', newValue?.reference || '')
                  formik.setFieldValue('fromEmployeeName', newValue?.fullName || '')
                  formik.setFieldValue('fromEmployeeId', newValue?.recordId || null)
                }}
                error={formik.touched.fromEmployeeId && Boolean(formik.errors.fromEmployeeId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                form={formik}
                valueField='reference'
                displayField='fullName'
                name='toEmployeeRef'
                label={labels.toEmployee}
                displayFieldWidth={2}
                required
                maxAccess={maxAccess}
                readOnly={!isExport}
                valueShow='toEmployeeRef'
                secondValueShow='toEmployeeName'
                onChange={(_, newValue) => {
                  formik.setFieldValue('toEmployeeRef', newValue?.reference || '')
                  formik.setFieldValue('toEmployeeName', newValue?.fullName || '')
                  formik.setFieldValue('toEmployeeId', newValue?.recordId || null)
                }}
                error={formik.touched.toEmployeeId && Boolean(formik.errors.toEmployeeId)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik.values.startDate}
                required
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.endDate}
                value={formik.values.endDate}
                required
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
