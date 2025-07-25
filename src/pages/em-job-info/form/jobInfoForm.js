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
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { MasterSource } from 'src/resources/MasterSource'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function JobInfoForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Group.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      reference: '',
      employeeId: null,
      employeeName: '',
      date: new Date(),
      departmentId: null,
      branchId: null,
      divisionId: null,
      reportToId: null,
      reportToName: '',
      notes: '',
      status: 1
    },
    validateOnChange: true,
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      departmentId: yup.number().required(),
      branchId: yup.number().required(),
      divisionId: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: EmployeeRepository.JobInfo.set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      })

      if (!obj.recordId) {
        formik.setFieldValue('recordId', response.recordId)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.JobInfo.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({ ...res.record, date: res.record.date ? formatDateFromApi(res.record.date) : null })
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      masterSource: MasterSource.ItemGroup,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.InventoryGroup}
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
                required
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='fullName'
                displayField='fullName'
                name='employeeId'
                label={labels.employee}
                form={formik}
                secondDisplayField={false}
                valueShow='employeeName'
                required
                maxAccess={maxAccess}
                editMode={editMode}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('employeeName', newValue?.name || '')
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
                required={true}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.DepartmentFilters.qry}
                parameters={`_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`}
                name='departmentId'
                label={labels.department}
                values={formik.values}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('departmentId', newValue?.recordId || null)
                }}
                error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.BranchFilters.qry}
                name='branchId'
                label={labels.branch}
                columnsInDropDown={[
                  { key: 'branchRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['branchRef', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('branchId', newValue?.recordId || null)
                }}
                required
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.DivisionFilters.qry}
                name='divisionId'
                label={labels.division}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'branchRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('divisionId', newValue?.recordId || null)
                }}
                error={formik.touched.divisionId && Boolean(formik.errors.divisionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.CompanyPositions.qry}
                parameters='_filter=&_size=1000&_startAt=0&_sortBy=recordId'
                name='positionId'
                label={labels.division}
                valueField='recordId'
                displayField={'name'}
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('positionId', newValue?.recordId || null)
                }}
                error={formik.touched.positionId && Boolean(formik.errors.positionId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='fullName'
                name='reportToId'
                label={labels.reportsTp}
                form={formik}
                secondDisplayField={false}
                valueShow='reportToName'
                required
                maxAccess={maxAccess}
                editMode={editMode}
                onChange={(event, newValue) => {
                  formik.setFieldValue('reportToName', newValue?.name || '')
                  formik.setFieldValue('reportToId', newValue?.recordId || null)
                }}
                errorCheck={'reportToId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
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
