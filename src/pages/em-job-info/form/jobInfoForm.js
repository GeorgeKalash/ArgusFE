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
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'

export default function JobInfoForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.JobInfo,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.JobInfo.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: '',
      employeeId: null,
      employeeName: '',
      date: new Date(),
      departmentId: null,
      branchId: null,
      divisionId: null,
      positionId: null,
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
      positionId: yup.number().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: EmployeeRepository.JobInfo.set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      refetchForm(response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  const isClosed = formik.values.wip == 2

  async function refetchForm(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: EmployeeRepository.JobInfo.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues({ ...res.record, date: res.record.date ? formatDateFromApi(res.record.date) : null })
    }
  }
  useEffect(() => {
    refetchForm(recordId)
  }, [])

  const onClose = async () => {
    const res = await postRequest({
      extension: EmployeeRepository.JobInfo.close,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values.date) })
    })

    toast.success(platformLabels.Closed)
    refetchForm(recordId)
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
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.JobInfos}
      functionId={SystemFunction.JobInfo}
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
                name='employeeId'
                required
                label={labels.employee}
                form={formik}
                secondDisplayField={false}
                valueShow='employeeName'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
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
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
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
                  { key: 'departmentRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                displayField={['departmentRef', 'name']}
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
                displayField='name'
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
                label={labels.position}
                required
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
                label={labels.reportsTo}
                form={formik}
                secondDisplayField={false}
                valueShow='reportToName'
                maxAccess={maxAccess}
                editMode={editMode}
                onChange={(event, newValue) => {
                  formik.setFieldValue('reportToName', newValue?.fullName || '')
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
