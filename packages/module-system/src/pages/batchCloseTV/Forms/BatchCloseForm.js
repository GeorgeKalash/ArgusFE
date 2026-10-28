import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ThreadProgress } from '@argus/shared-ui/src/components/Shared/ThreadProgress'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

export default function BatchCloseTVForm({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const today = new Date()

  const newStartDate = new Date()
  newStartDate.setMonth(0)
  newStartDate.setDate(1)

  const { formik } = useForm({
    initialValues: {
      startDate: newStartDate,
      endDate: today,
      status: 1
    },
    maxAccess: access,
    validationSchema: yup.object({
      startDate: yup.string().required(),
      endDate: yup.string().required()
    }),
    onSubmit: async obj => {
      if (!obj.batchId) {
        delete obj.batchId
        delete obj.batchRef
        delete obj.batchName
      }

      const res = await postRequest({
        extension: TimeAttendanceRepository.batchCloseTV.batch,
        record: JSON.stringify(obj)
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
      key: 'Locked',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} actions={actions} isSaved={false} editMode={true} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={_labels.startDate}
                value={formik.values?.startDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={_labels.endDate}
                value={formik.values?.endDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('endDate', '')}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.Branches.qry}
                name='branchId'
                label={_labels.branch}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={access}
                onChange={(_, newValue) => formik.setFieldValue('branchId', newValue?.recordId || null)}
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='reference'
                displayField='fullName'
                name='employeeId'
                label={_labels.employee}
                form={formik}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                maxAccess={access}
                displayFieldWidth={2}
                onChange={(_, newValue) => {
                  formik.setFieldValue('employeeName', newValue.fullName || '')
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck='employeeId'
              />
            </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={companyStructureRepository.Divisions.qry}
                  name='divisionId'
                  label={_labels.division}
                  valueField='recordId'
                  displayField={'name'}
                  maxAccess={access}
                  values={formik.values}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('divisionId', newValue?.recordId || null)
                  }}
                  error={formik.touched.divisionId && Boolean(formik.errors.divisionId)}
                />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.Departments.qry}
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
                onChange={(_, newValue) => {
                  formik.setFieldValue('departmentId', newValue?.recordId || null)
                }}
                error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.Batch.snapshot}
                parameters={{
                  _sortBy: 'recordId desc',
                  _functionId: SystemFunction.SalesInvoice
                }}
                name='batchId'
                label={_labels.batch}
                valueField='reference'
                displayField='name'
                valueShow='batchRef'
                secondValueShow='batchName'
                displayFieldWidth={2}
                form={formik}
                onChange={(_, newValue) => {
                  formik.setFieldValue('batchRef', newValue?.reference || '')
                  formik.setFieldValue('batchName', newValue?.name || '')
                  formik.setFieldValue('batchId', newValue?.recordId || null)
                }}
                error={formik.touched.batchId && Boolean(formik.errors.batchId)}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}