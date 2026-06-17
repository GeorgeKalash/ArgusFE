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
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'

export default function DepartmentsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: companyStructureRepository.Departments.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      departmentRef: '',
      name: '',
      supervisorId: null,
      parentId: null,
      caId: null,
      caName: '',
      ccId: null,
      scId: null,
      type: null,
      activeStatus: 1,
      costCenterId: null,
      isInactive: false
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: handleSubmit
  })

  async function handleSubmit(obj) {
    const response = await postRequest({
      extension: companyStructureRepository.Departments.set,
      record: JSON.stringify(obj)
    })

    if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
    toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
    invalidate()
  }

  useEffect(() => {
    const fetchRecord = async () => {
      if (recordId) {
        const res = await getRequest({
          extension: companyStructureRepository.Departments.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    }

    fetchRecord()
  }, [recordId])

  const editMode = !!formik.values.recordId

  return (
    <FormShell
      resourceId={ResourceIds.Departments}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='departmentRef'
                label={labels.reference}
                value={formik.values.departmentRef}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('departmentRef', '')}
                error={formik.touched.departmentRef && Boolean(formik.errors.departmentRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{
                  _startAt: 0,
                  _branchId: 0
                }}
                name='supervisorId'
                label={labels.departmentManager}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'firstName', value: 'Name' }
                ]}
                valueField='supervisorRef'
                displayField='name'
                maxAccess={maxAccess}
                displayFieldWidth={2}
                form={formik}
                valueShow='supervisorRef'
                secondValueShow='supervisorName'
                onChange={(_, newValue) => {
                  formik.setFieldValue('supervisorRef', newValue.reference || '')
                  formik.setFieldValue('supervisorName', newValue.fullName || '')
                  
                  formik.setFieldValue('supervisorId', newValue.recordId || null)
                }}
                />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.Departments.qry}
                parameters='_filter=&_size=30&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId'
                name='parentId'
                label={labels.parent}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('parentId', newValue?.recordId || null)}
                error={formik.touched.parentId && Boolean(formik.errors.parentId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.Calendar.qry}
                name='caId'
                label={labels.workingCalendar}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('caId', newValue?.recordId || null)
                  formik.setFieldValue('caName', newValue?.name || '')
                }}
                error={formik.touched.caId && Boolean(formik.errors.caId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.Schedule.qry}
                name='scId'
                label={labels.attendanceSchedule}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('scId', newValue?.recordId || null)
                  formik.setFieldValue('scName', newValue?.name || '')
                }}
                error={formik.touched.scId && Boolean(formik.errors.scId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TYPES_DEPARTMENT}
                name='type'
                label={labels.type}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('type', newValue?.key || null)
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={GeneralLedgerRepository.CostCenter.qry}
                parameters={`_params=&_startAt=0&_pageSize=200`}
                name='ccId'
                label={labels.costCenter}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('ccId', newValue?.recordId || null)
                }}
                error={formik.touched.ccId && Boolean(formik.errors.ccId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.isInactive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}