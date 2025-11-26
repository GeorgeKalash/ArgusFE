import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function ResetTVForm({ _labels, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: {
      startDate: null,
      endDate: null,
      employeeId: null,
      branchId: null
    },
    maxAccess,
    validationSchema: yup.object({
      startDate: yup
        .date()
        .required()
        .test(function (value) {
          const { endDate } = this.parent

          return value.getTime() <= endDate?.getTime()
        }),
      endDate: yup
        .date()
        .required()
        .test(function (value) {
          const { startDate } = this.parent

          return value.getTime() >= startDate?.getTime()
        })
    }),
    onSubmit: async data => {
      const { employeeId, branchId, ...rest } = data

      const dataFormatted = {
        ...rest,
        startDate: formatDateToApi(data.startDate),
        endDate: formatDateToApi(data.endDate),
        ...(employeeId && { employeeId }),
        ...(branchId && { branchId })
      }

      await postRequest({
        extension: TimeAttendanceRepository.TimeVariation.reset,
        record: JSON.stringify(dataFormatted)
      })

      toast.success(platformLabels.Updated)
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={_labels.fromDate}
                onChange={formik.setFieldValue}
                max={formik.values.endDate}
                maxAccess={maxAccess}
                required
                onClear={() => formik.setFieldValue('startDate', null)}
                value={formik.values?.startDate}
                error={formik.errors?.startDate && Boolean(formik.errors?.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={_labels.toDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                min={formik.values.startDate}
                required
                onClear={() => formik.setFieldValue('endDate', null)}
                value={formik.values?.endDate}
                error={formik.errors?.endDate && Boolean(formik.errors?.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{
                  _startAt: 0,
                  _branchId: 0
                }}
                filter={{ activeStatus: 1 }}
                name='employeeId'
                label={_labels.employee}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'firstName', value: 'Name' }
                ]}
                valueField='employeeRef'
                displayField='name'
                maxAccess={maxAccess}
                displayFieldWidth={2}
                form={formik}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                onChange={(_, newValue) => {
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.BranchFilters.qry}
                name='branchId'
                label={_labels.branch}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('branchId', newValue?.recordId || null)
                }}
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
