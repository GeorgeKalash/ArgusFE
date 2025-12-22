import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ThreadProgress } from '@argus/shared-ui/src/components/Shared/ThreadProgress'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

export default function HRGeneratePayrollForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      payId: null,
      employeeId: null,
      departmentId: null,
      branchId: null,
      positionId: null
    },
    maxAccess: access,
    validationSchema: yup.object({
      payId: yup.number().required()
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: PayrollRepository.GeneratePayroll.gen,
        record: JSON.stringify({
          payId: obj.payId,
          employeeId: obj.employeeId,
          departmentId: obj.departmentId,
          branchId: obj.branchId,
          positionId: obj.positionId
        })
      })

      stack({
        Component: ThreadProgress,
        props: {
          recordId: res.recordId
        },
        closable: false
      })

      toast.success(platformLabels.Added)
    }
  })

  const actions = [
    {
      key: 'generate',
      condition: true,
      onClick: () => formik.handleSubmit()
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} actions={actions} isSaved={false} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={PayrollRepository.Payroll.snapshot}
                valueField='reference'
                displayField='reference'
                secondDisplayField={false}
                firstValue={formik.values.payRef}
                name='payId'
                required
                label={_labels.payroll}
                form={formik}
                maxAccess={access}
                onChange={(_, newValue) => {
                  formik.setFieldValue('payRef', newValue?.reference || '')
                  formik.setFieldValue('payId', newValue?.recordId || null)
                }}
                errorCheck={'payId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='reference'
                displayField='fullName'
                name='employeeId'
                displayFieldWidth={2}
                label={_labels.employee}
                form={formik}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                maxAccess={access}
                onChange={(_, newValue) => {
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.DepartmentFilters.qry}
                parameters={`_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`}
                name='departmentId'
                label={_labels.department}
                values={formik.values}
                columnsInDropDown={[
                  { key: 'departmentRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                displayField={['departmentRef', 'name']}
                maxAccess={access}
                onChange={(_, newValue) => formik.setFieldValue('departmentId', newValue?.recordId || null)}
                error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.BranchFilters.qry}
                name='branchId'
                label={_labels.branch}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={access}
                onChange={(_, newValue) => formik.setFieldValue('branchId', newValue?.recordId || null)}
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.CompanyPositions.qry}
                parameters='_filter=&_size=1000&_startAt=0&_sortBy=recordId'
                name='positionId'
                label={_labels.position}
                valueField='recordId'
                displayField={['positionRef', 'name']}
                columnsInDropDown={[
                  { key: 'positionRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={access}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('positionId', newValue?.recordId || null)}
                error={formik.touched.positionId && Boolean(formik.errors.positionId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
